import { RedirectLocation, CallbackOptions, IDigitalOptions, IsAuthenticated } from "@interfaces/idigital";
import { IsAuthenticatedType } from "@enums/is.authenticated.type";
import IDigitalAccessToken from "@classes/idigital.access.token";
import { TokenResponse, TokenSet } from "@interfaces/tokens";
import IDigitalException from "@errors/idigital.exception";
import IDigitalIDToken from "@classes/idigital.id.token";
import { LogoutOptions } from "@interfaces/logout";
import IDigitalHelp from "@classes/idigital.help";
import IDigitalHttp from "@classes/idigital.http";
import { Discovery } from "@interfaces/discovery";
import { MESSAGES } from "@errors/messages.const";
import { DISCOVERY } from "@consts/discovery";
import { Session } from "@interfaces/session";
import { JWKS } from '@interfaces/jwks';

export default class IDigital {
	private readonly options: IDigitalOptions = undefined;
	private discovery: Readonly<Discovery> = undefined;
	private jwks: Readonly<JWKS> = undefined;

	private constructor(options: IDigitalOptions) {
		this.options = options;
		// Default options for oauth2 authorization code flow
		options.responseType = options.responseType || 'code';
		options.scopes = options.scopes || ['openid', 'email'];
		options.applicationType = options.applicationType || 'web';
		options.grantType = options.grantType || 'authorization_code';
		options.codeChallengeMethod = options.codeChallengeMethod || 'S256';
		options.tokenEndpointAuthMethod = options.tokenEndpointAuthMethod || 'none';
		options.postLogoutRedirectUri = options.postLogoutRedirectUri || options.issuer;
	}

	public static async create(options: IDigitalOptions): Promise<IDigital> {
		const instance = new IDigital(options);
		await instance.prepare();
		return instance;
	}

	public isEnabled(session: Session): boolean {
		return session.get('enable');
	}

	public async authorize(session: Session, location?: RedirectLocation): Promise<string | void> {
		const discovery = await this.getDiscovery();
		const authorizationEndpoint = discovery.authorization_endpoint;

		const pkceKeysPair = IDigitalHelp.getPkceKeysPair(this.options);
		const nonce = IDigitalHelp.getRandomBytes(32, this.options);
		const state = IDigitalHelp.getRandomBytes(32, this.options);

		// Update session object with provider response
		session.set('codeChallenge', pkceKeysPair.codeChallenge);
		session.set('codeVerifier', pkceKeysPair.codeVerifier);
		session.set('enable', true);
		session.set('nonce', nonce);
		session.set('state', state);

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

		if (location && typeof location.redirect == "function") {
			return location.redirect(url.href);
		}

		return url.href;
	}

	public async callback(session: Session, options: CallbackOptions): Promise<TokenSet> {
		if ((options.params || {}).iss !== this.options.issuer) {
			const message =  MESSAGES.DIVERGENT_ISSUER;
			throw new IDigitalException(400, message);
		}

		if ((options.params || {}).state !== session.get('state')) {
			const message = MESSAGES.DIVERGENT_STATE;
			throw new IDigitalException(400, message);
		}

		let idToken = null;
		let accessToken = null;
		const tokens = await this.getTokens(session, (options.params || {}).code);

		if (options.verifyTokens !== false) {
			const jwks = await this.getJwks();
			const nonce = session.get('nonce');
			idToken = await IDigitalIDToken.verify(tokens.id_token, jwks, nonce, this.options);
			accessToken = await IDigitalAccessToken.verify(tokens.access_token, jwks, this.options);
		} else {
			accessToken = tokens.access_token;
			idToken = tokens.id_token;
		}

		// Update session object with provider response
		session.set('accessToken', tokens.access_token);
		session.set('code', (options.params || {}).code);
		session.set('idToken', tokens.id_token);
		session.set('enable', true);

		return {
			nonce: options.include?.includes('nonce') ? session.get('nonce') : null,
			state: options.include?.includes('state') ? session.get('state') : null,
			accessToken,
			idToken
		};
	}

	public async isAuthenticated(session: Session, type: IsAuthenticatedType = IsAuthenticatedType.STRICT): Promise<IsAuthenticated> {
		try {
			let idToken = null;
			let accessToken = null;
			const jwks = await this.getJwks();

			if (type === IsAuthenticatedType.STRICT || IsAuthenticatedType.ONLY_ID_TOKEN) {
				const nonce = session.get('nonce');
				const $idToken = session.get('idToken');
				idToken = await IDigitalIDToken.verify($idToken, jwks, nonce, this.options);
			}

			if (type === IsAuthenticatedType.STRICT || IsAuthenticatedType.ONLY_ACCESS_TOKEN) {
				const $accessToken = session.get('accessToken');
				accessToken = await IDigitalAccessToken.verify($accessToken, jwks, this.options);
			}

			return {
				status: true,
				accessToken,
				idToken
			}
		} catch (e) {
			IDigitalHelp.applyVerboseMode(e, this.options);

			return {
				accessToken: null,
				idToken: null,
				status: false
			}
		}
	}

	public async logout(session: Session, options: LogoutOptions): Promise<string | void> {
		const discovery = await this.getDiscovery();
		const endSessionEndpoint = discovery.end_session_endpoint;

		const url = IDigitalHelp.getParameterizedUrl(endSessionEndpoint, [
			['post_logout_redirect_uri', this.options.postLogoutRedirectUri],
			['client_id', this.options.clientId]
		]);

		// Destroy session
		if (typeof session.destroy == "function") {
			session.destroy();
		}

		// Run function after session destroy
		if (typeof options.afterSessionDestroy == "function") {
			options.afterSessionDestroy();
		}

		if (options && typeof options.redirect == "function") {
			return options.redirect(url.href);
		}

		return url.href;
	}

	private async getTokens(session: Session, code: string): Promise<TokenResponse> {
		const discovery = await this.getDiscovery();
		const url = discovery.token_endpoint;

		return IDigitalHttp.getTokens(url, {
			code_challenge_method: this.options.codeChallengeMethod,
			code_challenge: session.get('codeChallenge'),
			code_verifier: session.get('codeVerifier'),
			redirect_uri: this.options.redirectUri,
			resource: this.options.applicationHost,
			grant_type: this.options.grantType,
			client_id: this.options.clientId,
			nonce: session.get('nonce'),
			code: code
		}, this.options);
	}

	private async prepare(): Promise<void> {
		await this.getDiscovery();
		await this.getJwks();
	}

	private async getJwks(): Promise<any> {
		if (this.options.jwks) {
			return this.options.jwks;
		}

		if (this.jwks) {
			return this.jwks;
		}

		if (this.options.cache) {
			const jwks = this.options.cache.get('jwks');
			if (jwks) {
				this.jwks = jwks;
				return this.jwks;
			}
		}

		const discovery = await this.getDiscovery();
		const jwks = await IDigitalHttp.getJwks(discovery.jwks_uri, this.options);

		if (this.options.cache) {
			this.options.cache.set('jwks', jwks);
		}

		this.jwks = jwks;
		return this.jwks;
	}

	private async getDiscovery(): Promise<Discovery> {
		if (this.options.discovery) {
			return this.options.discovery;
		}

		if (this.discovery) {
			return this.discovery;
		}

		if (this.options.cache) {
			const discovery = this.options.cache.get('discovery');
			if (discovery) {
				this.discovery = discovery;
				return this.discovery;
			}
		}

		const url = (this.options.issuer + DISCOVERY.PATHNAME).replace(/\/\//g, '/');
		const discovery = await IDigitalHttp.getDiscovery(url, this.options);

		if (this.options.cache) {
			this.options.cache.set('discovery', discovery);
		}

		this.discovery = discovery;
		return this.discovery;
	}
}
