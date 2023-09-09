import IDigitalAccessToken from './idigital.access.token.js';
import IDigitalException from '../errors/idigital.exception.js';
import IDigitalIDToken from './idigital.id.token.js';
import IDigitalHelp from './idigital.help.js';
import IDigitalHttp from './idigital.http.js';
import { MESSAGES } from '../errors/messages.const.js';
export default class IDigitalAuthorizationCode {
    constructor(idigital) {
        Object.defineProperty(this, "idigital", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: idigital
        });
        Object.defineProperty(this, "isAuthenticated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.idigital.isAuthenticated.bind(this.idigital)
        });
        Object.defineProperty(this, "logout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.idigital.logout.bind(this.idigital)
        });
    }
    static getConfig(options) {
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
    async authorize(session, location) {
        const $session = this.idigital.getSession(session);
        const discovery = await this.idigital.getDiscovery();
        const authorizationEndpoint = discovery.authorization_endpoint;
        const pkceKeysPair = IDigitalHelp.getPkceKeysPair(this.idigital.config);
        const nonce = IDigitalHelp.getRandomBytes(32, this.idigital.config);
        const state = IDigitalHelp.getRandomBytes(32, this.idigital.config);
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
    async callback(session, options) {
        var _a, _b;
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
        }
        else {
            accessToken = tokens.access_token;
            idToken = tokens.id_token;
        }
        $session.set('accessToken', tokens.access_token);
        $session.set('code', (options.params || {}).code);
        $session.set('idToken', tokens.id_token);
        $session.set('enable', true);
        return {
            nonce: ((_a = options.include) === null || _a === void 0 ? void 0 : _a.includes('nonce')) ? $session.get('nonce') : null,
            state: ((_b = options.include) === null || _b === void 0 ? void 0 : _b.includes('state')) ? $session.get('state') : null,
            accessToken,
            idToken,
        };
    }
    async getTokens(session, code) {
        const discovery = await this.idigital.getDiscovery();
        const $session = this.idigital.getSession(session);
        const url = discovery.token_endpoint;
        return IDigitalHttp.getTokens(url, {
            code_challenge_method: this.idigital.config.codeChallengeMethod,
            redirect_uri: this.idigital.config.redirectUri,
            resource: this.idigital.config.applicationHost,
            code_challenge: $session.get('codeChallenge'),
            code_verifier: $session.get('codeVerifier'),
            grant_type: this.idigital.config.grantType,
            client_id: this.idigital.config.clientId,
            nonce: $session.get('nonce'),
            code: code,
        }, this.idigital.config);
    }
}
//# sourceMappingURL=idigital.authorization.code.js.map