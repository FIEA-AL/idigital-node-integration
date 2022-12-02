export interface IAuthorizeResponse {
	state: string;
	code: string;
	iss: string;
}

export interface IAuthorizeLocation {
	redirect: (url: string) => void;
}
