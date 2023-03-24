import { AccessToken } from "./access.token";
import { IDToken } from "./id.token";
export interface TokenSet {
    accessToken: AccessToken | string;
    idToken: IDToken | string;
    nonce?: string;
    state?: string;
}
export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    id_token: string;
    scope: string;
}
