import { ISession } from "@interfaces/session";
export declare class IDigitalSession {
    private static NAME;
    static set(session: ISession, key: string, value: string): void;
    static get(session: ISession, key: string): any;
    static alreadyExists(session: ISession): boolean;
    static start(session: ISession): void;
    static destroy(session: ISession): void;
    private static isSessionRequired;
}
