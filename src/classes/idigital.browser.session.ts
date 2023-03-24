import { BrowserSession, BrowserSessionOptions, Session } from "@interfaces/session";
import { DEFAULT_SESSION_STORAGE_NAME } from "@consts/session";
import IDigitalException from "@errors/idigital.exception";
import { MESSAGES } from "@errors/messages.const";

export class IDigitalBrowserSession implements Session {
    private readonly options: BrowserSessionOptions;
    private readonly storage: BrowserSession;
    private readonly storageName: string;

    constructor(options: BrowserSessionOptions) {
        this.storageName = options.name || DEFAULT_SESSION_STORAGE_NAME;
        this.storage = options.storage;
        this.options = options;
        this.start();
    }

    public start(): void {
        if (!this.storage) {
            const message = MESSAGES.REQUIRED_SESSION;
            throw new IDigitalException(500, message);
        }

        if (!this.storage.getItem(this.storageName)) {
            this.storage.setItem(this.storageName, {});
        }
    }

    public destroy(): void {
        this.storage.clear();
    }

    public get(key: string): any {
        let object = this.storage.getItem(this.storageName);
        return object[key] ? object[key] : null;
    }

    public getAllKeys(): Record<string, any>{
        return this.storage.getItem(this.storageName)!;
    }

    public set(key: string, value: any): Session {
        const object = this.storage.getItem(this.storageName);
        this.storage.setItem(this.storageName, Object.assign(object, {
            [key]: value
        }));

        return this;
    }

    public setManyKeys(keys: Record<string, any>) {
        for (const key in keys) this.set(key, keys[key]);
        return this;
    }
}