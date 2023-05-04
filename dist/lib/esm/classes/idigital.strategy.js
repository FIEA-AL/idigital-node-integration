import IDigitalException from "../errors/idigital.exception.js";
import IDigitalHelp from "./idigital.help.js";
import { MESSAGES } from "../errors/messages.const.js";
import IDigitalSession from "./idigital.session.js";
import { Strategy } from 'passport-strategy';
import IDigital from "./idigital.js";
export default class IDigitalStrategy extends Strategy {
    constructor(options, verify) {
        super();
        Object.defineProperty(this, "_passReqToCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_verify", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (typeof verify !== 'function') {
            const message = MESSAGES.PASSPORT_CALLBACK_TYPE;
            throw new IDigitalException(500, message);
        }
        this.name = "idigital";
        this._verify = verify;
        if (options instanceof IDigital) {
            this._client = options;
            this._passReqToCallback = true;
        }
        else {
            this._client = options.client;
            this._passReqToCallback = options.passReqToCallback;
        }
    }
    authenticate(request, options) {
        (async () => {
            const params = IDigitalHelp.getRequestParams(request);
            const session = IDigitalSession.create(request.session);
            if (Object.keys(params).length === 0) {
                return this._client.authorize(session, this);
            }
            else {
                const tokenSet = await this._client.callback(session, { params });
                const userInfo = tokenSet.idToken.payload;
                const args = [
                    tokenSet,
                    userInfo,
                    this.verifyDone.bind(this)
                ];
                if (this._passReqToCallback) {
                    args.unshift(request);
                }
                this._verify(...args);
            }
        })().catch(error => {
            const self = this;
            self.error(error);
        });
    }
    verifyDone(error, user, info = {}) {
        const self = this;
        if (error) {
            self.error(error);
        }
        else if (!user) {
            self.fail(info);
        }
        else {
            self.success(user, info);
        }
    }
}
//# sourceMappingURL=idigital.strategy.js.map