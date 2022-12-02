export interface IAccessTokenHeader {
	alg: string;
	typ?: string;
	kid?: string;
}

export interface IAccessTokenPayload {
	client_id: string;
	scope: string;
	aud: string;
	iat: number;
	exp: number;
	iss: string;
	jti: string;
	sub: string;
}

export interface IAccessToken {
	payload: IAccessTokenPayload;
	header: IAccessTokenHeader;
}
