import IDigitalAccessToken from "@classes/idigital.access.token";
import IDigitalIDToken from "@classes/idigital.id.token";
import { EnvironmentType } from "@enums/environment.type";
import { Discovery } from "@interfaces/discovery";
import { Session } from "@interfaces/session";
import { JWKS } from "@interfaces/jwks";

export interface IDigitalOptions {
	jwks?: JWKS;
	cache?: Session;
	clientId: string;
	scopes?: string[];
	verbose?: boolean;
	grantType?: string;
	redirectUri: string;
	discovery?: Discovery;
	responseType?: string;
	defaultMaxAge?: number;
	applicationHost: string;
	issuer: EnvironmentType;
	applicationType?: string;
	codeChallengeMethod?: string;
	postLogoutRedirectUri?: string;
	tokenEndpointAuthMethod?: string;
}

export interface AuthorizeResponse {
	state: string;
	code: string;
	iss: string;
}

export interface RedirectLocation {
	redirect: (url: string) => any;
}

export interface IsAuthenticated {
	accessToken: IDigitalAccessToken;
	idToken: IDigitalIDToken;
	status: boolean;
}

export type CallbackOptions = {
	include?: Array<'nonce' | 'state'>;
	params: AuthorizeResponse;
	verifyTokens?: boolean;
}
