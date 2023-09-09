import { DEFAULT_SESSION_STORAGE_NAME } from '@consts/session';
import { Session, SessionOptions } from '@interfaces/session';
import IDigitalException from '@errors/idigital.exception';
import { MESSAGES } from '@errors/messages.const';

export default class IDigitalSession implements Session {
    private readonly storage: Record<string, any>;
    private readonly options: SessionOptions;
    private readonly storageName: string;

    constructor(options: SessionOptions = {}) {
        options.name = options.name || DEFAULT_SESSION_STORAGE_NAME;
        options.storage = options.storage || {};
        this.storageName = options.name;
        this.storage = options.storage;
        this.options = options;
        this.start();
    }

    public static create(storage: Record<string, any>, storageName?: string) {
        return new IDigitalSession({
            name: storageName,
            storage,
        });
    }

    public start(): void {
        if (!this.storage) {
            const message = MESSAGES.REQUIRED_SESSION;
            throw new IDigitalException(500, message);
        }

        if (!this.storage[this.storageName]) {
            this.storage[this.storageName] = {};
        }
    }

    public destroy(): void {
        delete this.storage[this.storageName];
    }

    public get(key: string): string {
        let object = this.storage[this.storageName];
        return object[key] ? object[key] : null;
    }

    public set(key: string, value: any): Session {
        this.storage[this.storageName][key] = value;
        return this;
    }

    public getAllKeys(): Record<string, any> {
        return this.storage[this.storageName];
    }

    public setManyKeys(keys: Record<string, any>): Session {
        for (const key in keys) this.set(key, keys[key]);
        return this;
    }
}
