import IDigitalToken from "./idigital.token.js";
import IDigitalHelp from "./idigital.help.js";
import * as NodeJose from 'node-jose';
import * as jose from 'jose';
export default class IDigitalAccessToken extends IDigitalToken {
    constructor(token, jwt) {
        super(token, jwt);
    }
    static async verify(token, keys, options) {
        if (token && IDigitalHelp.isJWT(token)) {
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
//# sourceMappingURL=idigital.access.token.js.map