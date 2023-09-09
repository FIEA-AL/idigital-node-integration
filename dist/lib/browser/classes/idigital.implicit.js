import IDigitalAccessToken from './idigital.access.token.js';
import IDigitalException from '../errors/idigital.exception.js';
import IDigitalIDToken from './idigital.id.token.js';
import IDigitalHelp from './idigital.help.js';
import { MESSAGES } from '../errors/messages.const.js';
import querystring from 'querystring-es3';
export default class IDigitalImplicit {
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
            defaultMaxAge: 86400,
            grantType: 'implicit',
            applicationType: 'web',
            responseType: 'id_token token',
            tokenEndpointAuthMethod: 'none',
            scopes: options.scopes || ['openid', 'profile', 'email'],
            postLogoutRedirectUri: options.postLogoutRedirectUri || options.issuer,
        };
    }
    async authorize(session, location) {
        const $session = this.idigital.getSession(session);
        const discovery = await this.idigital.getDiscovery();
        const authorizationEndpoint = discovery.authorization_endpoint;
        const nonce = IDigitalHelp.getRandomBytes(32, this.idigital.config);
        const state = IDigitalHelp.getRandomBytes(32, this.idigital.config);
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
    async callback(session, options) {
        var _a, _b, _c;
        const params = ((_a = options.params) !== null && _a !== void 0 ? _a : options.hash) ? this.getParamsByHash(options.hash) : null;
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
        }
        else {
            accessToken = params.access_token;
            idToken = params.id_token;
        }
        $session.set('accessToken', params.access_token);
        $session.set('idToken', params.id_token);
        $session.set('enable', true);
        return {
            nonce: ((_b = options.include) === null || _b === void 0 ? void 0 : _b.includes('nonce')) ? $session.get('nonce') : null,
            state: ((_c = options.include) === null || _c === void 0 ? void 0 : _c.includes('state')) ? $session.get('state') : null,
            accessToken,
            idToken,
        };
    }
    getParamsByHash(hash = '') {
        const str = hash.indexOf('#') === 0 ? hash.slice(1) : hash;
        return querystring.parse(str);
    }
}
//# sourceMappingURL=idigital.implicit.js.map