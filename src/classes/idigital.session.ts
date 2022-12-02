import { IDigitalException } from "@errors/idigital.exception";
import { MESSAGES } from "@errors/messages.const";
import { ISession } from "@interfaces/session";

export class IDigitalSession {
    private static NAME: string = 'idigital';

    public static set(session: ISession, key: string, value: string): void {
        if (this.alreadyExists(session)) {
            session[this.NAME][key] = value;
        }
    }

    public static get(session: ISession, key: string) {
        if (this.alreadyExists(session)) {
            return session[this.NAME][key] ?? null;
        }
    }

    public static alreadyExists(session: ISession): boolean {
        if (!session) this.isSessionRequired();
        return session && session[this.NAME];
    }

    public static start(session: ISession) {
        if (!this.alreadyExists(session)) {
            // IDigital session object
            session[this.NAME] = {};
        }
    }

    public static destroy(session: ISession) {
        if (this.alreadyExists(session)) {
            delete session[this.NAME];
        }
    }

    private static isSessionRequired() {
        const message = MESSAGES.REQUIRED_SESSION;
        throw new IDigitalException(500, message);
    }
}
