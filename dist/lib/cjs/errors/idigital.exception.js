"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = require("../consts/http.status.js");
class IDigitalException extends Error {
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
        this.name = http_status_1.HTTP_STATUS[status];
        this.date = new Date().toLocaleString();
    }
}
exports.default = IDigitalException;
//# sourceMappingURL=idigital.exception.js.map