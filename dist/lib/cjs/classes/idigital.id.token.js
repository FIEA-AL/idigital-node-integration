"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const idigital_token_1 = tslib_1.__importDefault(require("./idigital.token.js"));
const idigital_help_1 = tslib_1.__importDefault(require("./idigital.help.js"));
const NodeJose = tslib_1.__importStar(require("node-jose"));
const jose = tslib_1.__importStar(require("jose"));
class IDigitalIDToken extends idigital_token_1.default {
    constructor(token, jwt) {
        super(token, jwt);
    }
    static async verify(token, keys, nonce, options) {
        if (token && nonce && idigital_help_1.default.isJWT(token)) {
            const header = this.getHeader(token, 'JWT');
            const kid = header.kid;
            const alg = header.alg;
            const publicKey = this.getPublicKeyByKid(kid, alg, keys);
            const keyStore = await NodeJose.default.JWK.asKeyStore({ keys: [publicKey] });
            const jwks = jose.createLocalJWKSet(keyStore.toJSON());
            const jwt = await jose.jwtVerify(token, jwks, {
                algorithms: ['RS256'],
                typ: 'JWT',
            });
            this.verifyAudience(jwt.payload.aud, options.clientId);
            this.verifyNonce(jwt.payload.nonce, nonce);
            this.verifyIssuer(jwt.payload.iss, options.issuer);
            return new IDigitalIDToken(token, {
                header: jwt.protectedHeader,
                payload: jwt.payload,
            });
        }
        this.verifyNonce(nonce, nonce);
        this.isNotJWT();
    }
}
exports.default = IDigitalIDToken;
//# sourceMappingURL=idigital.id.token.js.map