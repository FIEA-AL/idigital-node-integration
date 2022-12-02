import type { IAuthorizeLocation, IAuthorizeResponse } from "@interfaces/authorize";
import type { IIsAuthenticated } from "@interfaces/is.authenticated";
import type { ITokenSet } from "@interfaces/token.set";
import type { IIDigital } from "@interfaces/idigital";
import type { ISession } from "@interfaces/session";
export default class IDigital {
    private readonly options;
    private discovery;
    private jwks;
    private constructor();
    static create(options: IIDigital): Promise<IDigital>;
    authorize(session: ISession, location: IAuthorizeLocation): void;
    callback(session: ISession, params: IAuthorizeResponse): Promise<ITokenSet>;
    isAuthenticated(session: ISession): Promise<IIsAuthenticated>;
    logout(session: ISession, location: IAuthorizeLocation, afterSessionDestroy?: Function): Promise<void>;
    private getTokens;
    private prepare;
    private getJwks;
    private getDiscovery;
}
