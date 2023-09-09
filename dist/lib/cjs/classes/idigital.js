"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const idigital_authorization_code_1 = tslib_1.__importDefault(require("./idigital.authorization.code.js"));
const is_authenticated_type_1 = require("../enums/is.authenticated.type.js");
const idigital_access_token_1 = tslib_1.__importDefault(require("./idigital.access.token.js"));
const idigital_implicit_1 = tslib_1.__importDefault(require("./idigital.implicit.js"));
const idigital_http_1 = tslib_1.__importDefault(require("./idigital.http.js"));
const messages_const_1 = require("../errors/messages.const.js");
const idigital_id_token_1 = tslib_1.__importDefault(require("./idigital.id.token.js"));
const discovery_1 = require("../consts/discovery.js");
const flow_type_1 = require("../enums/flow.type.js");
const idigital_help_1 = tslib_1.__importDefault(require("./idigital.help.js"));
class IDigital {
    constructor(config) {
        Object.defineProperty(this, "config", {
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
        this.config = config;
    }
    static async create(options) {
        const flow = this.getFlowType(options);
        const config = flow.getConfig(options);
        const instance = new IDigital(config);
        await instance.prepare();
        return instance;
    }
    get flow() {
        return {
            authorization: new idigital_authorization_code_1.default(this),
            implicit: new idigital_implicit_1.default(this),
        };
    }
    isEnabled(session) {
        return session.get('enable');
    }
    getSession(session) {
        return session !== null && session !== void 0 ? session : this.config.cache;
    }
    async getJwks() {
        if (this.config.jwks) {
            return this.config.jwks;
        }
        if (this.jwks) {
            return this.jwks;
        }
        if (this.config.cache) {
            const jwks = this.config.cache.get('jwks');
            if (jwks) {
                this.jwks = jwks;
                return this.jwks;
            }
        }
        const discovery = await this.getDiscovery();
        const jwks = await idigital_http_1.default.getJwks(discovery.jwks_uri, this.config);
        if (this.config.cache) {
            this.config.cache.set('jwks', jwks);
        }
        this.jwks = jwks;
        return this.jwks;
    }
    async getDiscovery() {
        if (this.config.discovery) {
            return this.config.discovery;
        }
        if (this.discovery) {
            return this.discovery;
        }
        if (this.config.cache) {
            const discovery = this.config.cache.get('discovery');
            if (discovery) {
                this.discovery = discovery;
                return this.discovery;
            }
        }
        const url = this.config.issuer + discovery_1.DISCOVERY.PATHNAME;
        const discovery = await idigital_http_1.default.getDiscovery(url, this.config);
        if (this.config.cache) {
            this.config.cache.set('discovery', discovery);
        }
        this.discovery = discovery;
        return this.discovery;
    }
    async isAuthenticated(session, type = is_authenticated_type_1.IsAuthenticatedType.STRICT) {
        try {
            let idToken = null;
            let accessToken = null;
            const jwks = await this.getJwks();
            const $session = this.getSession(session);
            if (type === is_authenticated_type_1.IsAuthenticatedType.STRICT || type === is_authenticated_type_1.IsAuthenticatedType.ONLY_ID_TOKEN) {
                const nonce = $session.get('nonce');
                const $idToken = $session.get('idToken');
                idToken = await idigital_id_token_1.default.verify($idToken, jwks, nonce, this.config);
            }
            if (type === is_authenticated_type_1.IsAuthenticatedType.STRICT || type === is_authenticated_type_1.IsAuthenticatedType.ONLY_ACCESS_TOKEN) {
                const $accessToken = $session.get('accessToken');
                accessToken = await idigital_access_token_1.default.verify($accessToken, jwks, this.config);
            }
            return {
                status: true,
                accessToken,
                idToken,
            };
        }
        catch (e) {
            idigital_help_1.default.applyVerboseMode(e, this.config);
            return {
                accessToken: null,
                idToken: null,
                status: false,
            };
        }
    }
    async logout(session, options) {
        const $session = this.getSession(session);
        const discovery = await this.getDiscovery();
        const endSessionEndpoint = discovery.end_session_endpoint;
        const url = idigital_help_1.default.getParameterizedUrl(endSessionEndpoint, [
            ['post_logout_redirect_uri', this.config.postLogoutRedirectUri],
            ['client_id', this.config.clientId],
        ]);
        if (typeof $session.destroy == 'function') {
            $session.destroy();
        }
        if (typeof options.afterSessionDestroy == 'function') {
            options.afterSessionDestroy();
        }
        if (options && typeof options.redirect == 'function') {
            return options.redirect(url.href);
        }
        return url.href;
    }
    async prepare() {
        await this.getDiscovery();
        await this.getJwks();
    }
    static getFlowType(options) {
        switch (options.flowType) {
            case flow_type_1.FlowType.AuthorizationCode:
                return idigital_authorization_code_1.default;
            case flow_type_1.FlowType.Implicit:
                return idigital_authorization_code_1.default;
            default: {
                const message = messages_const_1.MESSAGES.INVALID_FLOW_TYPE;
                throw new Error(message);
            }
        }
    }
}
exports.default = IDigital;
//# sourceMappingURL=idigital.js.map