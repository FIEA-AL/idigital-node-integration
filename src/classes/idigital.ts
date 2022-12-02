import type { IAuthorizeLocation, IAuthorizeResponse } from "@interfaces/authorize";
import { IDigitalAccessToken } from "@classes/idigital.access.token";
import type { IIsAuthenticated } from "@interfaces/is.authenticated";
import { IDigitalException } from "@errors/idigital.exception";
import type { ICallbackResponse } from "@interfaces/callback";
import { IDigitalIDToken } from "@classes/idigital.id.token";
import { IDigitalSession } from "@classes/idigital.session";
import type { IDiscovery } from "@interfaces/discovery";
import type { ITokenSet } from "@interfaces/token.set";
import type { IIDigital } from "@interfaces/idigital";
import { IDigitalHelp } from "@classes/idigital.help";
import { IDigitalHttp } from "@classes/idigital.http";
import type { ISession } from "@interfaces/session";
import { MESSAGES } from "@errors/messages.const";
import { DISCOVERY } from "@consts/discovery";
import { Prepare } from "@functions/prepare";
import path from "path";

export default class IDigital {
	private readonly options: IIDigital = undefined;
	private discovery: IDiscovery = undefined;
	private jwks = undefined;

	private constructor(options: IIDigital) {
		this.options = options;
		// Default options for oauth2 authorization code flow
		options.responseType = options.responseType || 'code';
		options.applicationType = options.applicationType || 'web';
		options.grantType = options.grantType || 'authorization_code';
		options.codeChallengeMethod = options.codeChallengeMethod || 'S256';
		options.tokenEndpointAuthMethod = options.tokenEndpointAuthMethod || 'none';
		options.postLogoutRedirectUri = options.postLogoutRedirectUri || options.issuer;
	}

	public static async create(options: IIDigital): Promise<IDigital> {
		const instance = new IDigital(options);
		await instance.prepare(options);
		return instance;
	}

	@Prepare
	public authorize(session: ISession, location: IAuthorizeLocation): void {
		const authorizationEndpoint = this.discovery.authorization_endpoint;
		const pkceKeysPair = IDigitalHelp.getPkceKeysPair();
		const nonce = IDigitalHelp.getRandomBytes();
		const state = IDigitalHelp.getRandomBytes();

		// Update session object with provider response
		IDigitalSession.set(session, 'codeChallenge', pkceKeysPair.codeChallenge);
		IDigitalSession.set(session, 'codeVerifier', pkceKeysPair.codeVerifier);
		IDigitalSession.set(session, 'nonce', nonce);
		IDigitalSession.set(session, 'state', state);

		const url = IDigitalHelp.getParameterizedUrl(authorizationEndpoint, [
			['code_challenge_method', this.options.codeChallengeMethod],
			['code_challenge', pkceKeysPair.codeChallenge],
			['response_type', this.options.responseType],
			['redirect_uri', this.options.redirectUri],
			['resource', this.options.applicationHost],
			['scope', this.options.scopes.join('+')],
			['client_id', this.options.clientId],
			['nonce', nonce],
			['state', state]
		]);

		return location.redirect(url.href);
	}

	@Prepare
	public async callback(session: ISession, params: IAuthorizeResponse): Promise<ITokenSet> {
		if (params?.iss !== this.options.issuer) {
			const message =  MESSAGES.DIVERGENT_ISSUER;
			throw new IDigitalException(400, message);
		}

		if (params?.state !== session.idigital.state) {
			const message = MESSAGES.DIVERGENT_STATE;
			throw new IDigitalException(400, message);
		}

		const nonce = session.idigital.nonce;
		const tokens = await this.getTokens(session, params?.code);
		const idToken = await IDigitalIDToken.verify(tokens.id_token, this.jwks, nonce, this.options);
		const accessToken = await IDigitalAccessToken.verify(tokens.access_token, this.jwks, this.options);

		// Update session object with provider response
		IDigitalSession.set(session, 'accessToken', tokens.access_token);
		IDigitalSession.set(session, 'idToken', tokens.id_token);
		IDigitalSession.set(session, 'code', params?.code);

		return {
			accessToken,
			idToken
		}
	}

	@Prepare
	public async isAuthenticated(session: ISession): Promise<IIsAuthenticated> {
		try {
			const nonce = session.idigital?.nonce;
			const $idToken = session.idigital?.idToken;
			const $accessToken = session.idigital?.accessToken;
			const idToken = await IDigitalIDToken.verify($idToken, this.jwks, nonce, this.options);
			const accessToken = await IDigitalAccessToken.verify($accessToken, this.jwks, this.options);
			return {
				status: true,
				accessToken,
				idToken
			}
		} catch (e) {
			return {
				accessToken: null,
				idToken: null,
				status: false
			}
		}
	}

	@Prepare
	public async logout(session: ISession, location: IAuthorizeLocation, afterSessionDestroy?: Function): Promise<void> {
		const isAuthenticated = await this.isAuthenticated(session);
		if (isAuthenticated.status) {
			const endSessionEndpoint = this.discovery.end_session_endpoint;
			const url = IDigitalHelp.getParameterizedUrl(endSessionEndpoint, [
				['post_logout_redirect_uri', this.options.postLogoutRedirectUri],
				['client_id', this.options.clientId]
			]);

			// Destroy IDigital object
			IDigitalSession.destroy(session);

			// Run function after session destroy
			if (typeof afterSessionDestroy == "function") {
				afterSessionDestroy();
			}

			return location.redirect(url.href);
		}
	}

	@Prepare
	private async getTokens(session: ISession, code: string): Promise<ICallbackResponse> {
		const url = this.discovery.token_endpoint;
		return IDigitalHttp.getTokens(url, {
			code_challenge_method: this.options.codeChallengeMethod,
			code_challenge: session.idigital.codeChallenge,
			code_verifier: session.idigital.codeVerifier,
			redirect_uri: this.options.redirectUri,
			resource: this.options.applicationHost,
			grant_type: this.options.grantType,
			client_id: this.options.clientId,
			nonce: session.idigital.nonce,
			code: code
		});
	}

	private async prepare(options: IIDigital): Promise<void> {
		this.discovery = await this.getDiscovery(options.discovery);
		this.jwks = await this.getJwks();
	}

	private async getJwks(): Promise<any> {
		const url = this.discovery.jwks_uri;
		return IDigitalHttp.getJwks(url);
	}

	private async getDiscovery(discovery: IDiscovery): Promise<IDiscovery> {
		if (discovery) return discovery;
		const issuer = this.options.issuer;
		const pathname = DISCOVERY.PATHNAME;
		const url = path.join(issuer, pathname);
		return IDigitalHttp.getDiscovery(url);
	}
}
