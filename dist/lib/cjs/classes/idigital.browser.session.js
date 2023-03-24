"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDigitalBrowserSession = void 0;
const tslib_1 = require("tslib");
const session_1 = require("../consts/session.js");
const idigital_exception_1 = tslib_1.__importDefault(require("../errors/idigital.exception.js"));
const messages_const_1 = require("../errors/messages.const.js");
class IDigitalBrowserSession {
    constructor(options) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "storage", {
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
    start() {
        if (!this.storage) {
            const message = messages_const_1.MESSAGES.REQUIRED_SESSION;
            throw new idigital_exception_1.default(500, message);
        }
        if (!this.storage.getItem(this.storageName)) {
            this.storage.setItem(this.storageName, {});
        }
    }
    destroy() {
        this.storage.clear();
    }
    get(key) {
        let object = this.storage.getItem(this.storageName);
        return object[key] ? object[key] : null;
    }
    getAllKeys() {
        return this.storage.getItem(this.storageName);
    }
    set(key, value) {
        const object = this.storage.getItem(this.storageName);
        this.storage.setItem(this.storageName, Object.assign(object, {
            [key]: value
        }));
        return this;
    }
    setManyKeys(keys) {
        for (const key in keys)
            this.set(key, keys[key]);
        return this;
    }
}
exports.IDigitalBrowserSession = IDigitalBrowserSession;
//# sourceMappingURL=idigital.browser.session.js.map