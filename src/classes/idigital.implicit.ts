import IDigitalAccessToken from '@classes/idigital.access.token';
import IDigitalException from '@errors/idigital.exception';
import IDigitalIDToken from '@classes/idigital.id.token';
import IDigitalHelp from '@classes/idigital.help';
import { MESSAGES } from '@errors/messages.const';
import { TokenSet } from '@interfaces/tokens';
import { Session } from '@interfaces/session';
import querystring from 'querystring-es3';
import {
    IDigital,
    IDigitalConfig,
    IDigitalOptions,
    RedirectLocation,
    ImplicitCallbackOptions,
    ImplicitAuthorizeResponse,
} from '@interfaces/idigital';

export default class IDigitalImplicit {
    public isAuthenticated = this.idigital.isAuthenticated.bind(this.idigital);
    public logout = this.idigital.logout.bind(this.idigital);
    constructor(private readonly idigital: IDigital) {}

    public static getConfig(options: IDigitalOptions): IDigitalConfig {
        return {
            ...options,
            defaultMaxAge: 86400,
            grantType: 'implicit',
            applicationType: 'web',
            responseType: 'id_token token',
            tokenEndpointAuthMethod: 'none',
            scopes: options.scopes || ['openid', 'profile', 'email'],
            postLogoutRedirectUri: options.postLogoutRedirectUri || options.issuer,
        };
    }

    public async authorize(session: Session, location?: RedirectLocation): Promise<string | void> {
        const $session = this.idigital.getSession(session);
        const discovery = await this.idigital.getDiscovery();
        const authorizationEndpoint = discovery.authorization_endpoint;

        const nonce = IDigitalHelp.getRandomBytes(32, this.idigital.config);
        const state = IDigitalHelp.getRandomBytes(32, this.idigital.config);

        // Update session object with provider response
        $session.set('enable', true);
        $session.set('nonce', nonce);
        $session.set('state', state);

        const url = IDigitalHelp.getParameterizedUrl(authorizationEndpoint, [
            ['response_type', this.idigital.config.responseType],
            ['redirect_uri', this.idigital.config.redirectUri],
            ['resource', this.idigital.config.applicationHost],
            ['scope', this.idigital.config.scopes.join('+')],
            ['client_id', this.idigital.config.clientId],
            ['nonce', nonce],
            ['state', state],
        ]);

        if (location && typeof location.redirect == 'function') {
            return location.redirect(url.href);
        }

        return url.href;
    }

    public async callback(session: Session, options: ImplicitCallbackOptions): Promise<TokenSet> {
        const params = options.params ?? options.hash ? this.getParamsByHash(options.hash) : null;
        const $session = this.idigital.getSession(session);
        let accessToken = null;
        let idToken = null;

        if (!params) {
            const message = MESSAGES.INVALID_CALLBACK_REQUEST_PARAMS;
            throw new IDigitalException(400, message);
        }

        if (params.state !== $session.get('state')) {
            const message = MESSAGES.DIVERGENT_STATE;
            throw new IDigitalException(400, message);
        }

        if (options.verifyTokens !== false) {
            const nonce = $session.get('nonce');
            const jwks = await this.idigital.getJwks();
            idToken = await IDigitalIDToken.verify(params.id_token, jwks, nonce, this.idigital.config);
            accessToken = await IDigitalAccessToken.verify(params.access_token, jwks, this.idigital.config);
        } else {
            accessToken = params.access_token;
            idToken = params.id_token;
        }

        // Update session object with provider response
        $session.set('accessToken', params.access_token);
        $session.set('idToken', params.id_token);
        $session.set('enable', true);

        return {
            nonce: options.include?.includes('nonce') ? $session.get('nonce') : null,
            state: options.include?.includes('state') ? $session.get('state') : null,
            accessToken,
            idToken,
        };
    }

    private getParamsByHash(hash: string = ''): ImplicitAuthorizeResponse {
        const str = hash.indexOf('#') === 0 ? hash.slice(1) : hash;
        return querystring.parse(str);
    }
}
