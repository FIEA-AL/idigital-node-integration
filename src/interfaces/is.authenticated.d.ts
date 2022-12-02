import { IDigitalAccessToken } from "@classes/idigital.access.token";
import { IDigitalIDToken } from "@classes/idigital.id.token";

export interface IIsAuthenticated {
	accessToken: IDigitalAccessToken;
	idToken: IDigitalIDToken;
	status: boolean;
}
