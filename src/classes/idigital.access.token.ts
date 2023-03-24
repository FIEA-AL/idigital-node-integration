import { AccessToken, AccessTokenHeader, AccessTokenPayload } from "@interfaces/access.token";
import { IDigitalOptions } from "@interfaces/idigital";
import IDigitalToken from "@classes/idigital.token";
import IDigitalHelp from "@classes/idigital.help";
import * as NodeJose from 'node-jose';
import * as jose from 'jose';

export default class IDigitalAccessToken extends IDigitalToken {
	declare public readonly payload: AccessTokenPayload;
	declare public readonly header: AccessTokenHeader;

	protected constructor(token: string, jwt: AccessToken) {
		super(token, jwt);
	}

	public static async verify(token?: string, keys?, options?: IDigitalOptions): Promise<IDigitalAccessToken> {
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

			this.verifyAudience(jwt.payload.aud as string, options.applicationHost);
			this.verifyClient(jwt.payload.client_id as string, options.clientId);
			this.verifyIssuer(jwt.payload.iss, options.issuer);

			return new IDigitalAccessToken(token, {
				header: jwt.protectedHeader,
				payload: jwt.payload
			} as any)
		}

		this.isNotJWT();
	}
}
