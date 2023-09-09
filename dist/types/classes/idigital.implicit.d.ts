import { TokenSet } from '../interfaces/tokens';
import { Session } from '../interfaces/session';
import { IDigital, IDigitalConfig, IDigitalOptions, RedirectLocation, ImplicitCallbackOptions } from '../interfaces/idigital';
export default class IDigitalImplicit {
    private readonly idigital;
    isAuthenticated: any;
    logout: any;
    constructor(idigital: IDigital);
    static getConfig(options: IDigitalOptions): IDigitalConfig;
    authorize(session: Session, location?: RedirectLocation): Promise<string | void>;
    callback(session: Session, options: ImplicitCallbackOptions): Promise<TokenSet>;
    private getParamsByHash;
}
