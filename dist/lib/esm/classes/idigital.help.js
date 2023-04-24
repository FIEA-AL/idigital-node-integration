import IDigitalException from "../errors/idigital.exception.js";
import { MESSAGES } from '../errors/messages.const.js';
import pkceChallenge from 'pkce-challenge';
import querystring from "querystring-es3";
import crypto from 'crypto';
import url from "url";
export default class IDigitalHelp {
    static applyVerboseMode(data, options) {
        if (options.verbose) {
            console.error(data);
        }
    }
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
    static getRandomBytes(bytes = 32, options) {
        try {
            const randomBytes = crypto.randomBytes(bytes);
            return this.getBase64Encoded(randomBytes);
        }
        catch (e) {
            IDigitalHelp.applyVerboseMode(e, options);
            const message = MESSAGES.COULD_NOT_GENERATE_BYTES;
            throw new IDigitalException(500, message);
        }
    }
    static getPkceKeysPair(options) {
        try {
            const data = pkceChallenge();
            return {
                codeVerifier: data.code_verifier,
                codeChallenge: data.code_challenge
            };
        }
        catch (e) {
            IDigitalHelp.applyVerboseMode(e, options);
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