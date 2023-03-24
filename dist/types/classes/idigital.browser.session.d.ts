import { BrowserSessionOptions, Session } from "../interfaces/session";
export declare class IDigitalBrowserSession implements Session {
    private readonly options;
    private readonly storage;
    private readonly storageName;
    constructor(options: BrowserSessionOptions);
    start(): void;
    destroy(): void;
    get(key: string): any;
    getAllKeys(): Record<string, any>;
    set(key: string, value: any): Session;
    setManyKeys(keys: Record<string, any>): this;
}
