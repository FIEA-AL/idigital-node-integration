"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const session_1 = require("../consts/session.js");
const idigital_exception_1 = tslib_1.__importDefault(require("../errors/idigital.exception.js"));
const messages_const_1 = require("../errors/messages.const.js");
class IDigitalSession {
    constructor(options) {
        Object.defineProperty(this, "storage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "storageName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.storageName = options.name || session_1.DEFAULT_SESSION_STORAGE_NAME;
        this.storage = options.storage;
        this.options = options;
        this.start();
    }
    static create(storage, storageName) {
        return new IDigitalSession({
            name: storageName,
            storage
        });
    }
    start() {
        if (!this.storage) {
            const message = messages_const_1.MESSAGES.REQUIRED_SESSION;
            throw new idigital_exception_1.default(500, message);
        }
        if (!this.storage[this.storageName]) {
            this.storage[this.storageName] = {};
        }
    }
    destroy() {
        delete this.storage[this.storageName];
    }
    get(key) {
        let object = this.storage[this.storageName];
        return object[key] ? object[key] : null;
    }
    set(key, value) {
        this.storage[this.storageName][key] = value;
        return this;
    }
    getAllKeys() {
        return this.storage[this.storageName];
    }
    setManyKeys(keys) {
        for (const key in keys)
            this.set(key, keys[key]);
        return this;
    }
}
exports.default = IDigitalSession;
//# sourceMappingURL=idigital.session.js.map