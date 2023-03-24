import { HTTP_STATUS } from "../consts/http.status.js";
export default class IDigitalException extends Error {
    constructor(status, message) {
        super(message);
        Object.defineProperty(this, "message", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "date", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.status = status;
        this.message = message;
        this.name = HTTP_STATUS[status];
        this.date = new Date().toLocaleString();
    }
}
//# sourceMappingURL=idigital.exception.js.map