"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const idigital_access_token_1 = tslib_1.__importDefault(require("./idigital.access.token.js"));
const idigital_exception_1 = tslib_1.__importDefault(require("../errors/idigital.exception.js"));
const idigital_id_token_1 = tslib_1.__importDefault(require("./idigital.id.token.js"));
const idigital_help_1 = tslib_1.__importDefault(require("./idigital.help.js"));
const messages_const_1 = require("../errors/messages.const.js");
const querystring_es3_1 = tslib_1.__importDefault(require("querystring-es3"));
class IDigitalImplicit {
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
        const nonce = idigital_help_1.default.getRandomBytes(32, this.idigital.config);
        const state = idigital_help_1.default.getRandomBytes(32, this.idigital.config);
        $session.set('enable', true);
        $session.set('nonce', nonce);
        $session.set('state', state);
        const url = idigital_help_1.default.getParameterizedUrl(authorizationEndpoint, [
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
            const message = messages_const_1.MESSAGES.INVALID_CALLBACK_REQUEST_PARAMS;
            throw new idigital_exception_1.default(400, message);
        }
        if (params.state !== $session.get('state')) {
            const message = messages_const_1.MESSAGES.DIVERGENT_STATE;
            throw new idigital_exception_1.default(400, message);
        }
        if (options.verifyTokens !== false) {
            const nonce = $session.get('nonce');
            const jwks = await this.idigital.getJwks();
            idToken = await idigital_id_token_1.default.verify(params.id_token, jwks, nonce, this.idigital.config);
            accessToken = await idigital_access_token_1.default.verify(params.access_token, jwks, this.idigital.config);
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
        return querystring_es3_1.default.parse(str);
    }
}
exports.default = IDigitalImplicit;
//# sourceMappingURL=idigital.implicit.js.map