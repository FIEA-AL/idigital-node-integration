import { DEFAULT_SESSION_STORAGE_NAME } from '../consts/session.js';
import IDigitalException from '../errors/idigital.exception.js';
import { MESSAGES } from '../errors/messages.const.js';
export class IDigitalBrowserSession {
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
        this.storageName = options.name || DEFAULT_SESSION_STORAGE_NAME;
        this.storage = options.storage;
        this.options = options;
        this.start();
    }
    start() {
        if (!this.storage) {
            const message = MESSAGES.REQUIRED_SESSION;
            throw new IDigitalException(500, message);
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
            [key]: value,
        }));
        return this;
    }
    setManyKeys(keys) {
        for (const key in keys)
            this.set(key, keys[key]);
        return this;
    }
}
//# sourceMappingURL=idigital.browser.session.js.map