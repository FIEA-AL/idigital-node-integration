"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const idigital_exception_1 = tslib_1.__importDefault(require("../errors/idigital.exception.js"));
const idigital_help_1 = tslib_1.__importDefault(require("./idigital.help.js"));
const messages_const_1 = require("../errors/messages.const.js");
const passport_strategy_1 = require("passport-strategy");
const idigital_1 = tslib_1.__importDefault(require("./idigital.js"));
class IDigitalStrategy extends passport_strategy_1.Strategy {
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
            const message = messages_const_1.MESSAGES.PASSPORT_CALLBACK_TYPE;
            throw new idigital_exception_1.default(500, message);
        }
        this.name = "idigital";
        this._verify = verify;
        if (options instanceof idigital_1.default) {
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
            const params = idigital_help_1.default.getRequestParams(request);
            if (Object.keys(params).length === 0) {
                return this._client.authorize(request.session, this);
            }
            else {
                const tokenSet = await this._client.callback(request.session, { params });
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
exports.default = IDigitalStrategy;
//# sourceMappingURL=idigital.strategy.js.map