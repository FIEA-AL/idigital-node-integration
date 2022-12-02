import { IDigitalException } from "../errors/idigital.exception.js";
import { MESSAGES } from "../errors/messages.const.js";
export class IDigitalSession {
    static set(session, key, value) {
        if (this.alreadyExists(session)) {
            session[this.NAME][key] = value;
        }
    }
    static get(session, key) {
        if (this.alreadyExists(session)) {
            return session[this.NAME][key] ?? null;
        }
    }
    static alreadyExists(session) {
        if (!session)
            this.isSessionRequired();
        return session && session[this.NAME];
    }
    static start(session) {
        if (!this.alreadyExists(session)) {
            session[this.NAME] = {};
        }
    }
    static destroy(session) {
        if (this.alreadyExists(session)) {
            delete session[this.NAME];
        }
    }
    static isSessionRequired() {
        const message = MESSAGES.REQUIRED_SESSION;
        throw new IDigitalException(500, message);
    }
}
Object.defineProperty(IDigitalSession, "NAME", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'idigital'
});
//# sourceMappingURL=idigital.session.js.map