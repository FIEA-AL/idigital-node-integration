import { IDigitalOptions, IDigitalConfig, IsAuthenticated } from '../interfaces/idigital';
import IDigitalAuthorizationCode from './idigital.authorization.code';
import { IsAuthenticatedType } from '../enums/is.authenticated.type';
import IDigitalImplicit from './idigital.implicit';
import { LogoutOptions } from '../interfaces/logout';
import { Discovery } from '../interfaces/discovery';
import { Session } from '../interfaces/session';
export default class IDigital {
    readonly config: Readonly<IDigitalConfig>;
    private discovery;
    private jwks;
    private constructor();
    static create(options: IDigitalOptions): Promise<IDigital>;
    get flow(): {
        authorization: IDigitalAuthorizationCode;
        implicit: IDigitalImplicit;
    };
    isEnabled(session: Session): boolean;
    getSession(session: Session): Session;
    getJwks(): Promise<any>;
    getDiscovery(): Promise<Discovery>;
    isAuthenticated(session: Session, type?: IsAuthenticatedType): Promise<IsAuthenticated>;
    logout(session: Session, options: LogoutOptions): Promise<string | void>;
    private prepare;
    private static getFlowType;
}
