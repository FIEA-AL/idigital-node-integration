import { __decorate, __metadata } from "tslib";
import { IDigitalAccessToken } from "./idigital.access.token.js";
import { IDigitalException } from "../errors/idigital.exception.js";
import { IDigitalIDToken } from "./idigital.id.token.js";
import { IDigitalSession } from "./idigital.session.js";
import { IDigitalHelp } from "./idigital.help.js";
import { IDigitalHttp } from "./idigital.http.js";
import { MESSAGES } from "../errors/messages.const.js";
import { DISCOVERY } from "../consts/discovery.js";
import { Prepare } from "../functions/prepare.js";
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
        options.applicationType = options.applicationType || 'web';
        options.grantType = options.grantType || 'authorization_code';
        options.codeChallengeMethod = options.codeChallengeMethod || 'S256';
        options.tokenEndpointAuthMethod = options.tokenEndpointAuthMethod || 'none';
        options.postLogoutRedirectUri = options.postLogoutRedirectUri || options.issuer;
    }
    static async create(options) {
        const instance = new IDigital(options);
        await instance.prepare(options);
        return instance;
    }
    authorize(session, location) {
        const authorizationEndpoint = this.discovery.authorization_endpoint;
        const pkceKeysPair = IDigitalHelp.getPkceKeysPair();
        const nonce = IDigitalHelp.getRandomBytes();
        const state = IDigitalHelp.getRandomBytes();
        IDigitalSession.set(session, 'codeChallenge', pkceKeysPair.codeChallenge);
        IDigitalSession.set(session, 'codeVerifier', pkceKeysPair.codeVerifier);
        IDigitalSession.set(session, 'nonce', nonce);
        IDigitalSession.set(session, 'state', state);
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
        return location.redirect(url.href);
    }
    async callback(session, params) {
        if (params?.iss !== this.options.issuer) {
            const message = MESSAGES.DIVERGENT_ISSUER;
            throw new IDigitalException(400, message);
        }
        if (params?.state !== session.idigital.state) {
            const message = MESSAGES.DIVERGENT_STATE;
            throw new IDigitalException(400, message);
        }
        const nonce = session.idigital.nonce;
        const tokens = await this.getTokens(session, params?.code);
        const idToken = await IDigitalIDToken.verify(tokens.id_token, this.jwks, nonce, this.options);
        const accessToken = await IDigitalAccessToken.verify(tokens.access_token, this.jwks, this.options);
        IDigitalSession.set(session, 'accessToken', tokens.access_token);
        IDigitalSession.set(session, 'idToken', tokens.id_token);
        IDigitalSession.set(session, 'code', params?.code);
        return {
            accessToken,
            idToken
        };
    }
    async isAuthenticated(session) {
        try {
            const nonce = session.idigital?.nonce;
            const $idToken = session.idigital?.idToken;
            const $accessToken = session.idigital?.accessToken;
            const idToken = await IDigitalIDToken.verify($idToken, this.jwks, nonce, this.options);
            const accessToken = await IDigitalAccessToken.verify($accessToken, this.jwks, this.options);
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
    async logout(session, location, afterSessionDestroy) {
        const isAuthenticated = await this.isAuthenticated(session);
        if (isAuthenticated.status) {
            const endSessionEndpoint = this.discovery.end_session_endpoint;
            const url = IDigitalHelp.getParameterizedUrl(endSessionEndpoint, [
                ['post_logout_redirect_uri', this.options.postLogoutRedirectUri],
                ['client_id', this.options.clientId]
            ]);
            IDigitalSession.destroy(session);
            if (typeof afterSessionDestroy == "function") {
                afterSessionDestroy();
            }
            return location.redirect(url.href);
        }
    }
    async getTokens(session, code) {
        const url = this.discovery.token_endpoint;
        return IDigitalHttp.getTokens(url, {
            code_challenge_method: this.options.codeChallengeMethod,
            code_challenge: session.idigital.codeChallenge,
            code_verifier: session.idigital.codeVerifier,
            redirect_uri: this.options.redirectUri,
            resource: this.options.applicationHost,
            grant_type: this.options.grantType,
            client_id: this.options.clientId,
            nonce: session.idigital.nonce,
            code: code
        });
    }
    async prepare(options) {
        this.discovery = await this.getDiscovery(options.discovery);
        this.jwks = await this.getJwks();
    }
    async getJwks() {
        const url = this.discovery.jwks_uri;
        return IDigitalHttp.getJwks(url);
    }
    async getDiscovery(discovery) {
        if (discovery)
            return discovery;
        const issuer = this.options.issuer;
        const pathname = DISCOVERY.PATHNAME;
        const url = path.join(issuer, pathname);
        return IDigitalHttp.getDiscovery(url);
    }
}
__decorate([
    Prepare,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IDigital.prototype, "authorize", null);
__decorate([
    Prepare,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IDigital.prototype, "callback", null);
__decorate([
    Prepare,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IDigital.prototype, "isAuthenticated", null);
__decorate([
    Prepare,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], IDigital.prototype, "logout", null);
__decorate([
    Prepare,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IDigital.prototype, "getTokens", null);
//# sourceMappingURL=idigital.js.map