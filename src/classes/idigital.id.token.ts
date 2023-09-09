import { IDToken, IDTokenHeader, IDTokenPayload } from '@interfaces/id.token';
import { IDigitalOptions } from '@interfaces/idigital';
import IDigitalToken from '@classes/idigital.token';
import IDigitalHelp from '@classes/idigital.help';
import * as NodeJose from 'node-jose';
import * as jose from 'jose';

export default class IDigitalIDToken extends IDigitalToken {
    public declare readonly payload: IDTokenPayload;
    public declare readonly header: IDTokenHeader;

    protected constructor(token: string, jwt: IDToken) {
        super(token, jwt);
    }

    public static async verify(token?: string, keys?, nonce?, options?: IDigitalOptions): Promise<IDigitalIDToken> {
        if (token && nonce && IDigitalHelp.isJWT(token)) {
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

            this.verifyAudience(jwt.payload.aud as string, options.clientId);
            this.verifyNonce(jwt.payload.nonce as string, nonce);
            this.verifyIssuer(jwt.payload.iss, options.issuer);

            return new IDigitalIDToken(token, {
                header: jwt.protectedHeader,
                payload: jwt.payload,
            } as any);
        }

        this.verifyNonce(nonce, nonce);
        this.isNotJWT();
    }
}
