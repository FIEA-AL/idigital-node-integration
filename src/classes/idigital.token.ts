import IDigitalException from '@errors/idigital.exception';
import IDigitalHelp from '@classes/idigital.help';
import { MESSAGES } from '@errors/messages.const';

export default class IDigitalToken {
    public readonly token: string;
    public readonly payload: any;
    public readonly header: any;

    protected constructor(token: string, jwt: any) {
        this.payload = jwt.payload;
        this.header = jwt.header;
        this.token = token;
    }

    protected static getHeader(token?: string, typ?: string) {
        const header = this.getData(token, 0);

        if (header.alg == null || header.alg != 'RS256') {
            const message = MESSAGES.JWT_WITHOUT_ALG;
            throw new IDigitalException(400, message);
        }

        if (header.typ == null || header.typ != typ) {
            const message = MESSAGES.JWT_WITHOUT_TYP;
            throw new IDigitalException(400, message);
        }

        if (header.kid == null) {
            const message = MESSAGES.JWT_WITHOUT_KID;
            throw new IDigitalException(400, message);
        }

        return header;
    }

    protected static getPayload(token?: string) {
        return this.getData(token, 1);
    }

    protected static getSignature(token?: string) {
        return this.getData(token, 2);
    }

    protected static isNotJWT(): void {
        const message = MESSAGES.INVALID_JWT;
        throw new IDigitalException(400, message);
    }

    protected static getPublicKeyByKid(kid?: string, alg?: string, keys?) {
        let publicKey = null;

        for (const value of keys.keys) {
            if (value.kid != null && value.alg != null) {
                if (value.kid == kid && value.alg == alg) {
                    publicKey = value;
                    break;
                }
            }
        }

        if (publicKey == null) {
            const message = MESSAGES.COULD_NOT_FIND_PUBLIC_KEYS;
            throw new IDigitalException(500, message);
        }

        return publicKey;
    }

    protected static verifyIssuer(value1?: string, value2?: string): void {
        this.verifyAttributesOfJWT(value1, value2, MESSAGES.DIVERGENT_ISSUER);
    }

    protected static verifyClient(value1?: string, value2?: string): void {
        this.verifyAttributesOfJWT(value1, value2, MESSAGES.DIVERGENT_CLIENT_ID);
    }

    protected static verifyAudience(value1?: string, value2?: string): void {
        this.verifyAttributesOfJWT(value1, value2, MESSAGES.DIVERGENT_AUDIENCE);
    }

    protected static verifyNonce(value1?: string, value2?: string): void {
        this.verifyAttributesOfJWT(value1, value2, MESSAGES.DIVERGENT_NONCE);
    }

    private static verifyAttributesOfJWT(value1?: string, value2?: string, message?: string): void {
        if (value1 == null || value2 == null || value1 != value2) {
            throw new IDigitalException(400, message);
        }
    }

    private static getData(token?: string, offset?: number) {
        if (token != null && IDigitalHelp.isJWT(token)) {
            let data = token.split('.').slice(offset, 1).pop();
            data = IDigitalHelp.getBase64Decoded(data);
            return JSON.parse(data);
        }

        this.isNotJWT();
    }
}
