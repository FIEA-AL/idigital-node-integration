import { StrategyOptions } from '../interfaces/strategy';
// @ts-ignore
import { Strategy } from 'passport-strategy';
import IDigital from './idigital';
export default class IDigitalStrategy extends Strategy {
    _passReqToCallback: boolean;
    _client: IDigital;
    _verify: Function;
    name: string;
    constructor(options: StrategyOptions | IDigital, verify: Function);
    authenticate(request: any, options: any): void;
    verifyDone(error: any, user: any, info?: {}): void;
}
