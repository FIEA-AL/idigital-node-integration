import { RedirectLocation, AuthorizationCodeCallbackOptions, IDigitalOptions, IDigitalConfig, IDigital } from '../interfaces/idigital';
import { TokenSet } from '../interfaces/tokens';
import { Session } from '../interfaces/session';
export default class IDigitalAuthorizationCode {
    private readonly idigital;
    isAuthenticated: any;
    logout: any;
    constructor(idigital: IDigital);
    static getConfig(options: IDigitalOptions): IDigitalConfig;
    authorize(session: Session, location?: RedirectLocation): Promise<string | void>;
    callback(session: Session, options: AuthorizationCodeCallbackOptions): Promise<TokenSet>;
    private getTokens;
}
