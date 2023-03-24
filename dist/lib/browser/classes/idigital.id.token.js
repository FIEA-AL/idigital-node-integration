import IDigitalToken from "./idigital.token.js";
import IDigitalHelp from "./idigital.help.js";
import * as NodeJose from 'node-jose';
import * as jose from 'jose';
export default class IDigitalIDToken extends IDigitalToken {
    constructor(token, jwt) {
        super(token, jwt);
    }
    static async verify(token, keys, nonce, options) {
        if (token && nonce && IDigitalHelp.isJWT(token)) {
            const header = this.getHeader(token, 'JWT');
            const kid = header.kid;
            const alg = header.alg;
            const publicKey = this.getPublicKeyByKid(kid, alg, keys);
            const keyStore = await NodeJose.default.JWK.asKeyStore({ keys: [publicKey] });
            const jwks = jose.createLocalJWKSet(keyStore.toJSON());
            const jwt = await jose.jwtVerify(token, jwks, {
                algorithms: ['RS256'],
                typ: 'JWT'
            });
            this.verifyAudience(jwt.payload.aud, options.clientId);
            this.verifyNonce(jwt.payload.nonce, nonce);
            this.verifyIssuer(jwt.payload.iss, options.issuer);
            return new IDigitalIDToken(token, {
                header: jwt.protectedHeader,
                payload: jwt.payload
            });
        }
        this.verifyNonce(nonce, nonce);
        this.isNotJWT();
    }
}
//# sourceMappingURL=idigital.id.token.js.map