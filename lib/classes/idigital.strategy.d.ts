import { IStrategyOptions } from "@interfaces/strategy";
import { Strategy } from 'passport-strategy';
import IDigital from "./idigital.js";
export declare class IDigitalStrategy extends Strategy {
    _passReqToCallback: boolean;
    _client: IDigital;
    _verify: Function;
    name: string;
    constructor(options: IStrategyOptions | IDigital, verify: Function);
    authenticate(request: any, options: any): void;
    verifyDone(error: any, user: any, info?: {}): void;
}
