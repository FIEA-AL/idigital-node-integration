"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const idigital_exception_1 = tslib_1.__importDefault(require("../errors/idigital.exception.js"));
const messages_const_1 = require("../errors/messages.const.js");
const pkce_challenge_1 = tslib_1.__importDefault(require("pkce-challenge"));
const querystring_es3_1 = tslib_1.__importDefault(require("querystring-es3"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const url_1 = tslib_1.__importDefault(require("url"));
class IDigitalHelp {
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
            return url_1.default.parse(request.url, true).query;
        }
        else if (request.method === 'POST') {
            const body = request.body || {};
            switch (typeof body) {
                case 'object':
                case 'string':
                    if (Buffer.isBuffer(body)) {
                        return querystring_es3_1.default.parse(body.toString('utf-8'));
                    }
                    else if (typeof body === 'string') {
                        return querystring_es3_1.default.parse(body);
                    }
                    else {
                        return body;
                    }
            }
        }
    }
    static getRandomBytes(bytes = 32, options) {
        try {
            const randomBytes = crypto_1.default.randomBytes(bytes);
            return this.getBase64Encoded(randomBytes);
        }
        catch (e) {
            IDigitalHelp.applyVerboseMode(e, options);
            const message = messages_const_1.MESSAGES.COULD_NOT_GENERATE_BYTES;
            throw new idigital_exception_1.default(500, message);
        }
    }
    static getPkceKeysPair(options) {
        try {
            const data = (0, pkce_challenge_1.default)();
            return {
                codeVerifier: data.code_verifier,
                codeChallenge: data.code_challenge
            };
        }
        catch (e) {
            IDigitalHelp.applyVerboseMode(e, options);
            const message = messages_const_1.MESSAGES.COULD_NOT_GENERATE_PKCE;
            throw new idigital_exception_1.default(500, message);
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
exports.default = IDigitalHelp;
//# sourceMappingURL=idigital.help.js.map