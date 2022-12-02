import { IAccessToken } from "@interfaces/access.token";
import { IIDToken } from "@interfaces/id.token";

export interface ITokenSet {
	accessToken: IAccessToken;
	idToken: IIDToken;
}
