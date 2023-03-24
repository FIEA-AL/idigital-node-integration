"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const idigital_exception_1 = tslib_1.__importDefault(require("../errors/idigital.exception.js"));
const idigital_help_1 = tslib_1.__importDefault(require("./idigital.help.js"));
const messages_const_1 = require("../errors/messages.const.js");
class IDigitalToken {
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
            const message = messages_const_1.MESSAGES.JWT_WITHOUT_ALG;
            throw new idigital_exception_1.default(400, message);
        }
        if (header.typ == null || header.typ != typ) {
            const message = messages_const_1.MESSAGES.JWT_WITHOUT_TYP;
            throw new idigital_exception_1.default(400, message);
        }
        if (header.kid == null) {
            const message = messages_const_1.MESSAGES.JWT_WITHOUT_KID;
            throw new idigital_exception_1.default(400, message);
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
        const message = messages_const_1.MESSAGES.INVALID_JWT;
        throw new idigital_exception_1.default(400, message);
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
            const message = messages_const_1.MESSAGES.COULD_NOT_FIND_PUBLIC_KEYS;
            throw new idigital_exception_1.default(500, message);
        }
        return publicKey;
    }
    static verifyIssuer(value1, value2) {
        this.verifyAttributesOfJWT(value1, value2, messages_const_1.MESSAGES.DIVERGENT_ISSUER);
    }
    static verifyClient(value1, value2) {
        this.verifyAttributesOfJWT(value1, value2, messages_const_1.MESSAGES.DIVERGENT_CLIENT_ID);
    }
    static verifyAudience(value1, value2) {
        this.verifyAttributesOfJWT(value1, value2, messages_const_1.MESSAGES.DIVERGENT_AUDIENCE);
    }
    static verifyNonce(value1, value2) {
        this.verifyAttributesOfJWT(value1, value2, messages_const_1.MESSAGES.DIVERGENT_NONCE);
    }
    static verifyAttributesOfJWT(value1, value2, message) {
        if (value1 == null || value2 == null || value1 != value2) {
            throw new idigital_exception_1.default(400, message);
        }
    }
    static getData(token, offset) {
        if (token != null && idigital_help_1.default.isJWT(token)) {
            let data = token.split('.').slice(offset, 1).pop();
            data = idigital_help_1.default.getBase64Decoded(data);
            return JSON.parse(data);
        }
        this.isNotJWT();
    }
}
exports.default = IDigitalToken;
//# sourceMappingURL=idigital.token.js.map