export type SessionType = {
	codeChallenge?: string;
	codeVerifier?: string;
	accessToken?: string;
	idToken?: string;
	state?: string;
	nonce?: string;
	code?: string;
};

export interface Session {
	start(): void;
	destroy(): void;
	get(key: string): any;
	getAllKeys(): Record<string, any>;
	set(key: string, value: any): Session;
	setManyKeys(keys: Record<string, any>): Session;
}

export type SessionOptions = {
    storage: Record<string, any>;
	name?: string;
}

export interface BrowserSession {
	clear(): void;
	getItem(key: string): any;
	setItem(key: string, value: any): void;
}

export type BrowserSessionOptions = {
    storage: BrowserSession;
	name?: string;
}