import { IsAuthenticatedType } from "../enums/is.authenticated.type.js";
import IDigitalAccessToken from "./idigital.access.token.js";
import IDigitalException from "../errors/idigital.exception.js";
import IDigitalIDToken from "./idigital.id.token.js";
import IDigitalHelp from "./idigital.help.js";
import IDigitalHttp from "./idigital.http.js";
import { MESSAGES } from "../errors/messages.const.js";
import { DISCOVERY } from "../consts/discovery.js";
import path from "path";
export default class IDigital {
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
        const pkceKeysPair = IDigitalHelp.getPkceKeysPair();
        const nonce = IDigitalHelp.getRandomBytes();
        const state = IDigitalHelp.getRandomBytes();
        session.set('codeChallenge', pkceKeysPair.codeChallenge);
        session.set('codeVerifier', pkceKeysPair.codeVerifier);
        session.set('enable', true);
        session.set('nonce', nonce);
        session.set('state', state);
        const url = IDigitalHelp.getParameterizedUrl(authorizationEndpoint, [
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
        if ((options.params || {}).iss !== this.options.issuer) {
            const message = MESSAGES.DIVERGENT_ISSUER;
            throw new IDigitalException(400, message);
        }
        if ((options.params || {}).state !== session.get('state')) {
            const message = MESSAGES.DIVERGENT_STATE;
            throw new IDigitalException(400, message);
        }
        let idToken = null;
        let accessToken = null;
        const tokens = await this.getTokens(session, (options.params || {}).code);
        if (options.verifyTokens !== false) {
            const jwks = await this.getJwks();
            const nonce = session.get('nonce');
            idToken = await IDigitalIDToken.verify(tokens.id_token, jwks, nonce, this.options);
            accessToken = await IDigitalAccessToken.verify(tokens.access_token, jwks, this.options);
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
            nonce: options.include.includes('nonce') ? session.get('nonce') : null,
            state: options.include.includes('state') ? session.get('state') : null,
            accessToken,
            idToken
        };
    }
    async isAuthenticated(session, type = IsAuthenticatedType.STRICT) {
        try {
            let idToken = null;
            let accessToken = null;
            const jwks = await this.getJwks();
            if (type === IsAuthenticatedType.STRICT || IsAuthenticatedType.ONLY_ID_TOKEN) {
                const nonce = session.get('nonce');
                const $idToken = session.get('idToken');
                idToken = await IDigitalIDToken.verify($idToken, jwks, nonce, this.options);
            }
            if (type === IsAuthenticatedType.STRICT || IsAuthenticatedType.ONLY_ACCESS_TOKEN) {
                const $accessToken = session.get('accessToken');
                accessToken = await IDigitalAccessToken.verify($accessToken, jwks, this.options);
            }
            return {
                status: true,
                accessToken,
                idToken
            };
        }
        catch (e) {
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
        const url = IDigitalHelp.getParameterizedUrl(endSessionEndpoint, [
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
        return IDigitalHttp.getTokens(url, {
            code_challenge_method: this.options.codeChallengeMethod,
            code_challenge: session.get('codeChallenge'),
            code_verifier: session.get('codeVerifier'),
            redirect_uri: this.options.redirectUri,
            resource: this.options.applicationHost,
            grant_type: this.options.grantType,
            client_id: this.options.clientId,
            nonce: session.get('nonce'),
            code: code
        });
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
        const jwks = await IDigitalHttp.getJwks(discovery.jwks_uri);
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
        const issuer = this.options.issuer;
        const pathname = DISCOVERY.PATHNAME;
        const url = path.join(issuer, pathname);
        const discovery = await IDigitalHttp.getDiscovery(url);
        if (this.options.cache) {
            this.options.cache.set('discovery', discovery);
        }
        this.discovery = discovery;
        return this.discovery;
    }
}
//# sourceMappingURL=idigital.js.map