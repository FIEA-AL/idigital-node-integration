import { IDigitalException } from "../errors/idigital.exception.js";
import { MESSAGES } from '../errors/messages.const.js';
import querystring from "querystring";
import crypto from 'crypto';
import url from "url";
export class IDigitalHelp {
    static getParameterizedUrl(url, params) {
        const $url = new URL(url);
        const $params = new URLSearchParams(params);
        return new URL(`${$url.href}?${decodeURIComponent($params.toString())}`);
    }
    static isJWT(input) {
        const pattern = /^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-+\/=]*)/;
        return typeof input === 'string' && pattern.test(input);
    }
    static getRequestParams(request) {
        if (request.method === 'GET') {
            return url.parse(request.url, true).query;
        }
        else if (request.method === 'POST') {
            const body = request.body || {};
            switch (typeof body) {
                case 'object':
                case 'string':
                    if (Buffer.isBuffer(body)) {
                        return querystring.parse(body.toString('utf-8'));
                    }
                    else if (typeof body === 'string') {
                        return querystring.parse(body);
                    }
                    else {
                        return body;
                    }
            }
        }
    }
    static getRandomBytes(bytes = 32) {
        try {
            return this.getBase64Encoded(crypto.randomBytes(bytes));
        }
        catch (error) {
            const message = MESSAGES.COULD_NOT_GENERATE_BYTES;
            throw new IDigitalException(500, message);
        }
    }
    static getPkceKeysPair() {
        try {
            const codeVerifier = this.getRandomBytes();
            const sha256 = crypto.createHash('sha256');
            const buffer = sha256.update(codeVerifier).digest();
            const codeChallenge = this.getBase64Encoded(buffer);
            return { codeVerifier, codeChallenge };
        }
        catch (error) {
            const message = MESSAGES.COULD_NOT_GENERATE_PKCE;
            throw new IDigitalException(500, message);
        }
    }
    static getBase64Encoded(input, encoding = 'utf8') {
        if (Buffer.isEncoding('base64url')) {
            return Buffer.from(input, encoding).toString('base64url');
        }
        else {
            const str = Buffer.from(input, encoding).toString('base64');
            return str.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        }
    }
    static getBase64Decoded(input) {
        return Buffer.from(input, 'base64').toString();
    }
}
//# sourceMappingURL=idigital.help.js.map