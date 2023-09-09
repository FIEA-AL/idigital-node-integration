import { IsAuthenticatedType } from '../enums/is.authenticated.type';
import IDigitalAccessToken from '../classes/idigital.access.token';
import { EnvironmentType } from '../enums/environment.type';
import IDigitalIDToken from '../classes/idigital.id.token';
import { Discovery } from './discovery';
import { Session } from './session';
import { FlowType } from '../enums/flow.type';
import { LogoutOptions } from './logout';
import { JWKS } from './jwks';
export interface IDigitalConfig extends IDigitalOptions {
    grantType: string;
    responseType: string;
    defaultMaxAge: number;
    applicationType: string;
    codeChallengeMethod?: string;
    tokenEndpointAuthMethod: string;
}
export interface IDigitalOptions {
    jwks?: JWKS;
    cache?: Session;
    clientId: string;
    scopes?: string[];
    verbose?: boolean;
    flowType: FlowType;
    redirectUri: string;
    clientSecret?: string;
    discovery?: Discovery;
    applicationHost: string;
    issuer: EnvironmentType;
    postLogoutRedirectUri?: string;
}
export interface AuthorizationCodeAuthorizeResponse {
    state: string;
    code: string;
    iss: string;
}
export interface ImplicitAuthorizeResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    id_token: string;
    scope: string;
    state: string;
}
export interface RedirectLocation {
    redirect: (url: string) => any;
}
export interface IsAuthenticated {
    accessToken: IDigitalAccessToken;
    idToken: IDigitalIDToken;
    status: boolean;
}
export type AuthorizationCodeCallbackOptions = {
    params: AuthorizationCodeAuthorizeResponse;
    include?: Array<'nonce' | 'state'>;
    verifyTokens?: boolean;
};
export type ImplicitCallbackOptions = {
    params?: ImplicitAuthorizeResponse;
    include?: Array<'nonce' | 'state'>;
    verifyTokens?: boolean;
    hash?: string;
};
export interface IDigital {
    isAuthenticated(session: Session, type: IsAuthenticatedType): Promise<IsAuthenticated>;
    logout(session: Session, options: LogoutOptions): Promise<string | void>;
    readonly config: Readonly<IDigitalConfig>;
    getSession(session: Session): Session;
    getDiscovery(): Promise<Discovery>;
    getJwks(): Promise<any>;
}
