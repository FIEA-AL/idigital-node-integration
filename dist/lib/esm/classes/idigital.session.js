import { DEFAULT_SESSION_STORAGE_NAME } from "../consts/session.js";
import IDigitalException from "../errors/idigital.exception.js";
import { MESSAGES } from "../errors/messages.const.js";
export default class IDigitalSession {
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
        this.storageName = options.name || DEFAULT_SESSION_STORAGE_NAME;
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
            const message = MESSAGES.REQUIRED_SESSION;
            throw new IDigitalException(500, message);
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
//# sourceMappingURL=idigital.session.js.map