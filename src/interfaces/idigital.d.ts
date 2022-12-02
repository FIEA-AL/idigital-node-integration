import { EnvironmentType } from "@enums/environment.type";
import { IDiscovery } from "@interfaces/discovery";

export interface IIDigital {
	scopes: string[];
	clientId: string;
	grantType?: string;
	redirectUri: string;
	responseType?: string;
	defaultMaxAge?: number;
	discovery?: IDiscovery;
	applicationHost: string;
	issuer: EnvironmentType;
	applicationType?: string;
	codeChallengeMethod?: string;
	postLogoutRedirectUri?: string;
	tokenEndpointAuthMethod?: string;
}
