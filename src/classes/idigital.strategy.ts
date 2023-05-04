import IDigitalException from "@errors/idigital.exception";
import { StrategyOptions } from "@interfaces/strategy";
import IDigitalHelp from "@classes/idigital.help";
import { MESSAGES } from "@errors/messages.const";
import IDigitalSession from "./idigital.session";
import { IDToken } from '@interfaces/id.token';
// @ts-ignore
import { Strategy } from 'passport-strategy';
import IDigital from "@classes/idigital";

export default class IDigitalStrategy extends Strategy {
    public _passReqToCallback: boolean;
    public _client: IDigital;
    public _verify: Function;
    public name: string

    constructor(options: StrategyOptions | IDigital, verify: Function) {
        super();

        if (typeof verify !== 'function') {
            const message = MESSAGES.PASSPORT_CALLBACK_TYPE;
            throw new IDigitalException(500, message);
        }

        this.name = "idigital";
        this._verify = verify;

        if (options instanceof IDigital) {
            this._client = options;
            this._passReqToCallback = true;
        } else {
            this._client = options.client;
            this._passReqToCallback = options.passReqToCallback;
        }
    }

    public authenticate(request, options) {
        (async () => {
            const params = IDigitalHelp.getRequestParams(request);
            const session = IDigitalSession.create(request.session);

            if (Object.keys(params).length === 0) {
                return this._client.authorize(session, this as any);
            } else {
                const tokenSet = await this._client.callback(session, { params });
                const userInfo = (tokenSet.idToken as IDToken).payload;

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
            const self = this as any;
            self.error(error);
        });
    }

    public verifyDone(error, user, info = {}) {
        const self = this as any;
        if (error) {
            self.error(error);
        } else if (!user) {
            self.fail(info);
        } else {
            self.success(user, info);
        }
    }
}
