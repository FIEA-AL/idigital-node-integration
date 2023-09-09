import {
    RedirectLocation,
    AuthorizationCodeCallbackOptions,
    IDigitalOptions,
    IDigitalConfig,
    IDigital,
} from '@interfaces/idigital';
import IDigitalAccessToken from '@classes/idigital.access.token';
import { TokenResponse, TokenSet } from '@interfaces/tokens';
import IDigitalException from '@errors/idigital.exception';
import IDigitalIDToken from '@classes/idigital.id.token';
import IDigitalHelp from '@classes/idigital.help';
import IDigitalHttp from '@classes/idigital.http';
import { MESSAGES } from '@errors/messages.const';
import { Session } from '@interfaces/session';

export default class IDigitalAuthorizationCode {
    public isAuthenticated = this.idigital.isAuthenticated.bind(this.idigital);
    public logout = this.idigital.logout.bind(this.idigital);
    constructor(private readonly idigital: IDigital) {}

    public static getConfig(options: IDigitalOptions): IDigitalConfig {
        return {
            ...options,
            responseType: 'code',
            defaultMaxAge: 86400,
            applicationType: 'web',
            codeChallengeMethod: 'S256',
            grantType: 'authorization_code',
            tokenEndpointAuthMethod: 'none',
            scopes: options.scopes || ['openid', 'profile', 'email'],
            postLogoutRedirectUri: options.postLogoutRedirectUri || options.issuer,
        };
    }

    public async authorize(session: Session, location?: RedirectLocation): Promise<string | void> {
        const $session = this.idigital.getSession(session);
        const discovery = await this.idigital.getDiscovery();
        const authorizationEndpoint = discovery.authorization_endpoint;

        const pkceKeysPair = IDigitalHelp.getPkceKeysPair(this.idigital.config);
        const nonce = IDigitalHelp.getRandomBytes(32, this.idigital.config);
        const state = IDigitalHelp.getRandomBytes(32, this.idigital.config);

        // Update session object with provider response
        $session.set('codeChallenge', pkceKeysPair.codeChallenge);
        $session.set('codeVerifier', pkceKeysPair.codeVerifier);
        $session.set('enable', true);
        $session.set('nonce', nonce);
        $session.set('state', state);

        const url = IDigitalHelp.getParameterizedUrl(authorizationEndpoint, [
            ['code_challenge_method', this.idigital.config.codeChallengeMethod],
            ['response_type', this.idigital.config.responseType],
            ['redirect_uri', this.idigital.config.redirectUri],
            ['resource', this.idigital.config.applicationHost],
            ['scope', this.idigital.config.scopes.join('+')],
            ['code_challenge', pkceKeysPair.codeChallenge],
            ['client_id', this.idigital.config.clientId],
            ['nonce', nonce],
            ['state', state],
        ]);

        if (location && typeof location.redirect == 'function') {
            return location.redirect(url.href);
        }

        return url.href;
    }

    public async callback(session: Session, options: AuthorizationCodeCallbackOptions): Promise<TokenSet> {
        const $session = this.idigital.getSession(session);
        let accessToken = null;
        let idToken = null;

        if ((options.params || {}).iss !== this.idigital.config.issuer) {
            const message = MESSAGES.DIVERGENT_ISSUER;
            throw new IDigitalException(400, message);
        }

        if ((options.params || {}).state !== $session.get('state')) {
            const message = MESSAGES.DIVERGENT_STATE;
            throw new IDigitalException(400, message);
        }

        const tokens = await this.getTokens($session, (options.params || {}).code);

        if (options.verifyTokens !== false) {
            const nonce = $session.get('nonce');
            const jwks = await this.idigital.getJwks();
            idToken = await IDigitalIDToken.verify(tokens.id_token, jwks, nonce, this.idigital.config);
            accessToken = await IDigitalAccessToken.verify(tokens.access_token, jwks, this.idigital.config);
        } else {
            accessToken = tokens.access_token;
            idToken = tokens.id_token;
        }

        // Update session object with provider response
        $session.set('accessToken', tokens.access_token);
        $session.set('code', (options.params || {}).code);
        $session.set('idToken', tokens.id_token);
        $session.set('enable', true);

        return {
            nonce: options.include?.includes('nonce') ? $session.get('nonce') : null,
            state: options.include?.includes('state') ? $session.get('state') : null,
            accessToken,
            idToken,
        };
    }

    private async getTokens(session: Session, code: string): Promise<TokenResponse> {
        const discovery = await this.idigital.getDiscovery();
        const $session = this.idigital.getSession(session);
        const url = discovery.token_endpoint;

        return IDigitalHttp.getTokens(
            url,
            {
                code_challenge_method: this.idigital.config.codeChallengeMethod,
                redirect_uri: this.idigital.config.redirectUri,
                resource: this.idigital.config.applicationHost,
                code_challenge: $session.get('codeChallenge'),
                code_verifier: $session.get('codeVerifier'),
                grant_type: this.idigital.config.grantType,
                client_id: this.idigital.config.clientId,
                nonce: $session.get('nonce'),
                code: code,
            },
            this.idigital.config,
        );
    }
}
