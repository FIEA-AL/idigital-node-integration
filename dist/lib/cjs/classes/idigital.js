"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const is_authenticated_type_1 = require("../enums/is.authenticated.type.js");
const idigital_access_token_1 = tslib_1.__importDefault(require("./idigital.access.token.js"));
const idigital_exception_1 = tslib_1.__importDefault(require("../errors/idigital.exception.js"));
const idigital_id_token_1 = tslib_1.__importDefault(require("./idigital.id.token.js"));
const idigital_help_1 = tslib_1.__importDefault(require("./idigital.help.js"));
const idigital_http_1 = tslib_1.__importDefault(require("./idigital.http.js"));
const messages_const_1 = require("../errors/messages.const.js");
const discovery_1 = require("../consts/discovery.js");
class IDigital {
    constructor(options) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        Object.defineProperty(this, "discovery", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        Object.defineProperty(this, "jwks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        this.options = options;
        options.responseType = options.responseType || 'code';
        options.scopes = options.scopes || ['openid', 'email'];
        options.applicationType = options.applicationType || 'web';
        options.grantType = options.grantType || 'authorization_code';
        options.codeChallengeMethod = options.codeChallengeMethod || 'S256';
        options.tokenEndpointAuthMethod = options.tokenEndpointAuthMethod || 'none';
        options.postLogoutRedirectUri = options.postLogoutRedirectUri || options.issuer;
    }
    static async create(options) {
        const instance = new IDigital(options);
        await instance.prepare();
        return instance;
    }
    isEnabled(session) {
        return session.get('enable');
    }
    async authorize(session, location) {
        const discovery = await this.getDiscovery();
        const authorizationEndpoint = discovery.authorization_endpoint;
        const pkceKeysPair = idigital_help_1.default.getPkceKeysPair(this.options);
        const nonce = idigital_help_1.default.getRandomBytes(32, this.options);
        const state = idigital_help_1.default.getRandomBytes(32, this.options);
        session.set('codeChallenge', pkceKeysPair.codeChallenge);
        session.set('codeVerifier', pkceKeysPair.codeVerifier);
        session.set('enable', true);
        session.set('nonce', nonce);
        session.set('state', state);
        const url = idigital_help_1.default.getParameterizedUrl(authorizationEndpoint, [
            ['code_challenge_method', this.options.codeChallengeMethod],
            ['code_challenge', pkceKeysPair.codeChallenge],
            ['response_type', this.options.responseType],
            ['redirect_uri', this.options.redirectUri],
            ['resource', this.options.applicationHost],
            ['scope', this.options.scopes.join('+')],
            ['client_id', this.options.clientId],
            ['nonce', nonce],
            ['state', state]
        ]);
        if (location && typeof location.redirect == "function") {
            return location.redirect(url.href);
        }
        return url.href;
    }
    async callback(session, options) {
        var _a, _b;
        if ((options.params || {}).iss !== this.options.issuer) {
            const message = messages_const_1.MESSAGES.DIVERGENT_ISSUER;
            throw new idigital_exception_1.default(400, message);
        }
        if ((options.params || {}).state !== session.get('state')) {
            const message = messages_const_1.MESSAGES.DIVERGENT_STATE;
            throw new idigital_exception_1.default(400, message);
        }
        let idToken = null;
        let accessToken = null;
        const tokens = await this.getTokens(session, (options.params || {}).code);
        if (options.verifyTokens !== false) {
            const jwks = await this.getJwks();
            const nonce = session.get('nonce');
            idToken = await idigital_id_token_1.default.verify(tokens.id_token, jwks, nonce, this.options);
            accessToken = await idigital_access_token_1.default.verify(tokens.access_token, jwks, this.options);
        }
        else {
            accessToken = tokens.access_token;
            idToken = tokens.id_token;
        }
        session.set('accessToken', tokens.access_token);
        session.set('code', (options.params || {}).code);
        session.set('idToken', tokens.id_token);
        session.set('enable', true);
        return {
            nonce: ((_a = options.include) === null || _a === void 0 ? void 0 : _a.includes('nonce')) ? session.get('nonce') : null,
            state: ((_b = options.include) === null || _b === void 0 ? void 0 : _b.includes('state')) ? session.get('state') : null,
            accessToken,
            idToken
        };
    }
    async isAuthenticated(session, type = is_authenticated_type_1.IsAuthenticatedType.STRICT) {
        try {
            let idToken = null;
            let accessToken = null;
            const jwks = await this.getJwks();
            if (type === is_authenticated_type_1.IsAuthenticatedType.STRICT || is_authenticated_type_1.IsAuthenticatedType.ONLY_ID_TOKEN) {
                const nonce = session.get('nonce');
                const $idToken = session.get('idToken');
                idToken = await idigital_id_token_1.default.verify($idToken, jwks, nonce, this.options);
            }
            if (type === is_authenticated_type_1.IsAuthenticatedType.STRICT || is_authenticated_type_1.IsAuthenticatedType.ONLY_ACCESS_TOKEN) {
                const $accessToken = session.get('accessToken');
                accessToken = await idigital_access_token_1.default.verify($accessToken, jwks, this.options);
            }
            return {
                status: true,
                accessToken,
                idToken
            };
        }
        catch (e) {
            idigital_help_1.default.applyVerboseMode(e, this.options);
            return {
                accessToken: null,
                idToken: null,
                status: false
            };
        }
    }
    async logout(session, options) {
        const discovery = await this.getDiscovery();
        const endSessionEndpoint = discovery.end_session_endpoint;
        const url = idigital_help_1.default.getParameterizedUrl(endSessionEndpoint, [
            ['post_logout_redirect_uri', this.options.postLogoutRedirectUri],
            ['client_id', this.options.clientId]
        ]);
        if (typeof session.destroy == "function") {
            session.destroy();
        }
        if (typeof options.afterSessionDestroy == "function") {
            options.afterSessionDestroy();
        }
        if (options && typeof options.redirect == "function") {
            return options.redirect(url.href);
        }
        return url.href;
    }
    async getTokens(session, code) {
        const discovery = await this.getDiscovery();
        const url = discovery.token_endpoint;
        return idigital_http_1.default.getTokens(url, {
            code_challenge_method: this.options.codeChallengeMethod,
            code_challenge: session.get('codeChallenge'),
            code_verifier: session.get('codeVerifier'),
            redirect_uri: this.options.redirectUri,
            resource: this.options.applicationHost,
            grant_type: this.options.grantType,
            client_id: this.options.clientId,
            nonce: session.get('nonce'),
            code: code
        }, this.options);
    }
    async prepare() {
        await this.getDiscovery();
        await this.getJwks();
    }
    async getJwks() {
        if (this.options.jwks) {
            return this.options.jwks;
        }
        if (this.jwks) {
            return this.jwks;
        }
        if (this.options.cache) {
            const jwks = this.options.cache.get('jwks');
            if (jwks) {
                this.jwks = jwks;
                return this.jwks;
            }
        }
        const discovery = await this.getDiscovery();
        const jwks = await idigital_http_1.default.getJwks(discovery.jwks_uri, this.options);
        if (this.options.cache) {
            this.options.cache.set('jwks', jwks);
        }
        this.jwks = jwks;
        return this.jwks;
    }
    async getDiscovery() {
        if (this.options.discovery) {
            return this.options.discovery;
        }
        if (this.discovery) {
            return this.discovery;
        }
        if (this.options.cache) {
            const discovery = this.options.cache.get('discovery');
            if (discovery) {
                this.discovery = discovery;
                return this.discovery;
            }
        }
        const url = this.options.issuer + discovery_1.DISCOVERY.PATHNAME;
        const discovery = await idigital_http_1.default.getDiscovery(url, this.options);
        if (this.options.cache) {
            this.options.cache.set('discovery', discovery);
        }
        this.discovery = discovery;
        return this.discovery;
    }
}
exports.default = IDigital;
//# sourceMappingURL=idigital.js.map