import IDigitalException from "../errors/idigital.exception.js";
import IDigitalHelp from "./idigital.help.js";
import { MESSAGES } from "../errors/messages.const.js";
export default class IDigitalToken {
    constructor(token, jwt) {
        Object.defineProperty(this, "token", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "payload", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "header", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.payload = jwt.payload;
        this.header = jwt.header;
        this.token = token;
    }
    static getHeader(token, typ) {
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
    static getPayload(token) {
        return this.getData(token, 1);
    }
    static getSignature(token) {
        return this.getData(token, 2);
    }
    static isNotJWT() {
        const message = MESSAGES.INVALID_JWT;
        throw new IDigitalException(400, message);
    }
    static getPublicKeyByKid(kid, alg, keys) {
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
    static verifyIssuer(value1, value2) {
        this.verifyAttributesOfJWT(value1, value2, MESSAGES.DIVERGENT_ISSUER);
    }
    static verifyClient(value1, value2) {
        this.verifyAttributesOfJWT(value1, value2, MESSAGES.DIVERGENT_CLIENT_ID);
    }
    static verifyAudience(value1, value2) {
        this.verifyAttributesOfJWT(value1, value2, MESSAGES.DIVERGENT_AUDIENCE);
    }
    static verifyNonce(value1, value2) {
        this.verifyAttributesOfJWT(value1, value2, MESSAGES.DIVERGENT_NONCE);
    }
    static verifyAttributesOfJWT(value1, value2, message) {
        if (value1 == null || value2 == null || value1 != value2) {
            throw new IDigitalException(400, message);
        }
    }
    static getData(token, offset) {
        if (token != null && IDigitalHelp.isJWT(token)) {
            let data = token.split('.').slice(offset, 1).pop();
            data = IDigitalHelp.getBase64Decoded(data);
            return JSON.parse(data);
        }
        this.isNotJWT();
    }
}
//# sourceMappingURL=idigital.token.js.map