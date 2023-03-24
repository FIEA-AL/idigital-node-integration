import { Session, SessionOptions } from "../interfaces/session";
export default class IDigitalSession implements Session {
    private readonly storage;
    private readonly options;
    private readonly storageName;
    constructor(options: SessionOptions);
    static create(storage: Record<string, any>, storageName?: string): IDigitalSession;
    start(): void;
    destroy(): void;
    get(key: string): string;
    set(key: string, value: any): Session;
    getAllKeys(): Record<string, any>;
    setManyKeys(keys: Record<string, any>): Session;
}
