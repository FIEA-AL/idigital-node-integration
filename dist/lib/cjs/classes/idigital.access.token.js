"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const idigital_token_1 = tslib_1.__importDefault(require("./idigital.token.js"));
const idigital_help_1 = tslib_1.__importDefault(require("./idigital.help.js"));
const NodeJose = tslib_1.__importStar(require("node-jose"));
const jose = tslib_1.__importStar(require("jose"));
class IDigitalAccessToken extends idigital_token_1.default {
    constructor(token, jwt) {
        super(token, jwt);
    }
    static async verify(token, keys, options) {
        if (token && idigital_help_1.default.isJWT(token)) {
            const header = this.getHeader(token, 'at+jwt');
            const kid = header.kid;
            const alg = header.alg;
            const publicKey = this.getPublicKeyByKid(kid, alg, keys);
            const keyStore = await NodeJose.default.JWK.asKeyStore({ keys: [publicKey] });
            const jwks = jose.createLocalJWKSet(keyStore.toJSON());
            const jwt = await jose.jwtVerify(token, jwks, {
                algorithms: ['RS256'],
                typ: 'at+jwt'
            });
            this.verifyAudience(jwt.payload.aud, options.applicationHost);
            this.verifyClient(jwt.payload.client_id, options.clientId);
            this.verifyIssuer(jwt.payload.iss, options.issuer);
            return new IDigitalAccessToken(token, {
                header: jwt.protectedHeader,
                payload: jwt.payload
            });
        }
        this.isNotJWT();
    }
}
exports.default = IDigitalAccessToken;
//# sourceMappingURL=idigital.access.token.js.map