export type SessionType = {
	codeChallenge?: string;
	codeVerifier?: string;
	accessToken?: string;
	idToken?: string;
	state?: string;
	nonce?: string;
	code?: string;
};

export interface ISession {
	idigital?: SessionType;
}
