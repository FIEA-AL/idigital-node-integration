"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const idigital_exception_1 = tslib_1.__importDefault(require("../errors/idigital.exception.js"));
const messages_const_1 = require("../errors/messages.const.js");
const axios_1 = tslib_1.__importDefault(require("axios"));
const axiosInstance = axios_1.default.create();
class IDigitalHttp {
    static getDiscovery(url) {
        return this.get(url);
    }
    static getJwks(url) {
        return this.get(url);
    }
    static async getTokens(url, data) {
        return this.post(url, data);
    }
    static get(url) {
        const headers = { 'Content-Type': this.JSON_TYPE };
        return axiosInstance.get(url, { headers })
            .then(response => response.data)
            .catch(() => {
            const message = messages_const_1.MESSAGES.HTTP_ERROR;
            throw new idigital_exception_1.default(500, message);
        });
    }
    static post(url, data) {
        const headers = { 'Content-Type': this.WWW_FORM_TYPE };
        return axiosInstance.post(url, data, { headers })
            .then(response => response.data)
            .catch(() => {
            const message = messages_const_1.MESSAGES.HTTP_ERROR;
            throw new idigital_exception_1.default(500, message);
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