import IDigitalAuthorizationCode from './idigital.authorization.code.js';
import { IsAuthenticatedType } from '../enums/is.authenticated.type.js';
import IDigitalAccessToken from './idigital.access.token.js';
import IDigitalImplicit from './idigital.implicit.js';
import IDigitalHttp from './idigital.http.js';
import { MESSAGES } from '../errors/messages.const.js';
import IDigitalIDToken from './idigital.id.token.js';
import { DISCOVERY } from '../consts/discovery.js';
import { FlowType } from '../enums/flow.type.js';
import IDigitalHelp from './idigital.help.js';
export default class IDigital {
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
            authorization: new IDigitalAuthorizationCode(this),
            implicit: new IDigitalImplicit(this),
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
        const jwks = await IDigitalHttp.getJwks(discovery.jwks_uri, this.config);
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
        const url = this.config.issuer + DISCOVERY.PATHNAME;
        const discovery = await IDigitalHttp.getDiscovery(url, this.config);
        if (this.config.cache) {
            this.config.cache.set('discovery', discovery);
        }
        this.discovery = discovery;
        return this.discovery;
    }
    async isAuthenticated(session, type = IsAuthenticatedType.STRICT) {
        try {
            let idToken = null;
            let accessToken = null;
            const jwks = await this.getJwks();
            const $session = this.getSession(session);
            if (type === IsAuthenticatedType.STRICT || type === IsAuthenticatedType.ONLY_ID_TOKEN) {
                const nonce = $session.get('nonce');
                const $idToken = $session.get('idToken');
                idToken = await IDigitalIDToken.verify($idToken, jwks, nonce, this.config);
            }
            if (type === IsAuthenticatedType.STRICT || type === IsAuthenticatedType.ONLY_ACCESS_TOKEN) {
                const $accessToken = $session.get('accessToken');
                accessToken = await IDigitalAccessToken.verify($accessToken, jwks, this.config);
            }
            return {
                status: true,
                accessToken,
                idToken,
            };
        }
        catch (e) {
            IDigitalHelp.applyVerboseMode(e, this.config);
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
        const url = IDigitalHelp.getParameterizedUrl(endSessionEndpoint, [
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
            case FlowType.AuthorizationCode:
                return IDigitalAuthorizationCode;
            case FlowType.Implicit:
                return IDigitalAuthorizationCode;
            default: {
                const message = MESSAGES.INVALID_FLOW_TYPE;
                throw new Error(message);
            }
        }
    }
}
//# sourceMappingURL=idigital.js.map