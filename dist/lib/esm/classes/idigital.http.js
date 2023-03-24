import IDigitalException from "../errors/idigital.exception.js";
import { MESSAGES } from "../errors/messages.const.js";
import axios from 'axios';
const axiosInstance = axios.create();
export default class IDigitalHttp {
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
            const message = MESSAGES.HTTP_ERROR;
            throw new IDigitalException(500, message);
        });
    }
    static post(url, data) {
        const headers = { 'Content-Type': this.WWW_FORM_TYPE };
        return axiosInstance.post(url, data, { headers })
            .then(response => response.data)
            .catch(() => {
            const message = MESSAGES.HTTP_ERROR;
            throw new IDigitalException(500, message);
        });
    }
}
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