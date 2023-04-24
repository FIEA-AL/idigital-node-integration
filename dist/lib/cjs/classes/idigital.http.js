"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const idigital_exception_1 = tslib_1.__importDefault(require("../errors/idigital.exception.js"));
const messages_const_1 = require("../errors/messages.const.js");
const idigital_help_1 = tslib_1.__importDefault(require("./idigital.help.js"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const axiosInstance = axios_1.default.create();
class IDigitalHttp {
    static getJwks(url, options) {
        return this.get(url, options);
    }
    static getDiscovery(url, options) {
        return this.get(url, options);
    }
    static async getTokens(url, data, options) {
        return this.post(url, data, options);
    }
    static get(url, options) {
        const headers = { 'Content-Type': this.JSON_TYPE };
        return axiosInstance.get(url, { headers })
            .then(response => response.data)
            .catch(e => {
            idigital_help_1.default.applyVerboseMode(e, options);
            throw new idigital_exception_1.default(500, messages_const_1.MESSAGES.HTTP_ERROR);
        });
    }
    static post(url, data, options) {
        const headers = { 'Content-Type': this.WWW_FORM_TYPE };
        return axiosInstance.post(url, data, { headers })
            .then(response => response.data)
            .catch(e => {
            idigital_help_1.default.applyVerboseMode(e, options);
            throw new idigital_exception_1.default(500, messages_const_1.MESSAGES.HTTP_ERROR);
        });
    }
}
exports.default = IDigitalHttp;
Object.defineProperty(IDigitalHttp, "WWW_FORM_TYPE", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'application/x-www-form-urlencoded'
});
Object.defineProperty(IDigitalHttp, "JSON_TYPE", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'application/json'
});
//# sourceMappingURL=idigital.http.js.map