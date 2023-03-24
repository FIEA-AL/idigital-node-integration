import { RedirectLocation, CallbackOptions, IDigitalOptions, IsAuthenticated } from "../interfaces/idigital";
import { IsAuthenticatedType } from "../enums/is.authenticated.type";
import { TokenSet } from "../interfaces/tokens";
import { LogoutOptions } from "../interfaces/logout";
import { Session } from "../interfaces/session";
export default class IDigital {
    private readonly options;
    private discovery;
    private jwks;
    private constructor();
    static create(options: IDigitalOptions): Promise<IDigital>;
    isEnabled(session: Session): boolean;
    authorize(session: Session, location?: RedirectLocation): Promise<string | void>;
    callback(session: Session, options: CallbackOptions): Promise<TokenSet>;
    isAuthenticated(session: Session, type?: IsAuthenticatedType): Promise<IsAuthenticated>;
    logout(session: Session, options: LogoutOptions): Promise<string | void>;
    private getTokens;
    private prepare;
    private getJwks;
    private getDiscovery;
}
