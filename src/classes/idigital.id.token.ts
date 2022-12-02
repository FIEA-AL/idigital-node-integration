import { IIDToken, IIDTokenHeader, IIDTokenPayload} from "@interfaces/id.token";
import { IDigitalToken } from "@classes/idigital.token";
import { IDigitalHelp } from "@classes/idigital.help";
import { IIDigital } from "@interfaces/idigital";
import * as NodeJose from 'node-jose';
import * as jose from 'jose';

export class IDigitalIDToken extends IDigitalToken {
	declare public readonly payload: IIDTokenPayload;
	declare public readonly header: IIDTokenHeader;

	protected constructor(token: string, jwt: IIDToken) {
		super(token, jwt);
	}

	public static async verify(token?: string, keys?, nonce?, options?: IIDigital): Promise<IDigitalIDToken> {
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

			this.verifyAudience(jwt.payload.aud as string, options.clientId);
			this.verifyNonce(jwt.payload.nonce as string, nonce);
			this.verifyIssuer(jwt.payload.iss, options.issuer);

			return new IDigitalIDToken(token, {
				header: jwt.protectedHeader,
				payload: jwt.payload
			} as any);
		}

		this.verifyNonce(nonce, nonce);
		this.isNotJWT();
	}
}
