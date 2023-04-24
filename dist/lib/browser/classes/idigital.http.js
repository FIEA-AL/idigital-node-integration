import IDigitalException from "../errors/idigital.exception.js";
import { MESSAGES } from "../errors/messages.const.js";
import IDigitalHelp from "./idigital.help.js";
import axios from 'axios';
const axiosInstance = axios.create();
export default class IDigitalHttp {
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
            IDigitalHelp.applyVerboseMode(e, options);
            throw new IDigitalException(500, MESSAGES.HTTP_ERROR);
        });
    }
    static post(url, data, options) {
        const headers = { 'Content-Type': this.WWW_FORM_TYPE };
        return axiosInstance.post(url, data, { headers })
            .then(response => response.data)
            .catch(e => {
            IDigitalHelp.applyVerboseMode(e, options);
            throw new IDigitalException(500, MESSAGES.HTTP_ERROR);
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