import { IDigitalOptions, IDigitalConfig, IsAuthenticated } from '@interfaces/idigital';
import IDigitalAuthorizationCode from './idigital.authorization.code';
import { IsAuthenticatedType } from '@enums/is.authenticated.type';
import IDigitalAccessToken from './idigital.access.token';
import IDigitalImplicit from './idigital.implicit';
import { LogoutOptions } from '@interfaces/logout';
import IDigitalHttp from '@classes/idigital.http';
import { Discovery } from '@interfaces/discovery';
import { MESSAGES } from '@errors/messages.const';
import IDigitalIDToken from './idigital.id.token';
import { DISCOVERY } from '@consts/discovery';
import { Session } from '@interfaces/session';
import { FlowType } from '@enums/flow.type';
import IDigitalHelp from './idigital.help';
import { JWKS } from '@interfaces/jwks';

export default class IDigital {
    public readonly config: Readonly<IDigitalConfig> = undefined;
    private discovery: Readonly<Discovery> = undefined;
    private jwks: Readonly<JWKS> = undefined;

    private constructor(config: IDigitalConfig) {
        this.config = config;
    }

    public static async create(options: IDigitalOptions): Promise<IDigital> {
        const flow = this.getFlowType(options);
        const config = flow.getConfig(options);
        const instance = new IDigital(config);
        await instance.prepare();
        return instance;
    }

    public get flow() {
        return {
            authorization: new IDigitalAuthorizationCode(this),
            implicit: new IDigitalImplicit(this),
        };
    }

    public isEnabled(session: Session): boolean {
        return session.get('enable');
    }

    public getSession(session: Session): Session {
        return session ?? this.config.cache;
    }

    public async getJwks(): Promise<any> {
        if (this.config.jwks) {
            return this.config.jwks;
        }

        if (this.jwks) {
            return this.jwks;
        }

        if (this.config.cache) {
            const jwks = this.config.cache.get('jwks');
            if (jwks) {
                this.jwks = jwks;
                return this.jwks;
            }
        }

        const discovery = await this.getDiscovery();
        const jwks = await IDigitalHttp.getJwks(discovery.jwks_uri, this.config);

        if (this.config.cache) {
            this.config.cache.set('jwks', jwks);
        }

        this.jwks = jwks;
        return this.jwks;
    }

    public async getDiscovery(): Promise<Discovery> {
        if (this.config.discovery) {
            return this.config.discovery;
        }

        if (this.discovery) {
            return this.discovery;
        }

        if (this.config.cache) {
            const discovery = this.config.cache.get('discovery');
            if (discovery) {
                this.discovery = discovery;
                return this.discovery;
            }
        }

        const url = this.config.issuer + DISCOVERY.PATHNAME;
        const discovery = await IDigitalHttp.getDiscovery(url, this.config);

        if (this.config.cache) {
            this.config.cache.set('discovery', discovery);
        }

        this.discovery = discovery;
        return this.discovery;
    }

    public async isAuthenticated(
        session: Session,
        type: IsAuthenticatedType = IsAuthenticatedType.STRICT,
    ): Promise<IsAuthenticated> {
        try {
            let idToken = null;
            let accessToken = null;
            const jwks = await this.getJwks();
            const $session = this.getSession(session);

            if (type === IsAuthenticatedType.STRICT || type === IsAuthenticatedType.ONLY_ID_TOKEN) {
                const nonce = $session.get('nonce');
                const $idToken = $session.get('idToken');
                idToken = await IDigitalIDToken.verify($idToken, jwks, nonce, this.config);
            }

            if (type === IsAuthenticatedType.STRICT || type === IsAuthenticatedType.ONLY_ACCESS_TOKEN) {
                const $accessToken = $session.get('accessToken');
                accessToken = await IDigitalAccessToken.verify($accessToken, jwks, this.config);
            }

            return {
                status: true,
                accessToken,
                idToken,
            };
        } catch (e) {
            IDigitalHelp.applyVerboseMode(e, this.config);

            return {
                accessToken: null,
                idToken: null,
                status: false,
            };
        }
    }

    public async logout(session: Session, options: LogoutOptions): Promise<string | void> {
        const $session = this.getSession(session);
        const discovery = await this.getDiscovery();
        const endSessionEndpoint = discovery.end_session_endpoint;

        const url = IDigitalHelp.getParameterizedUrl(endSessionEndpoint, [
            ['post_logout_redirect_uri', this.config.postLogoutRedirectUri],
            ['client_id', this.config.clientId],
        ]);

        // Destroy session
        if (typeof $session.destroy == 'function') {
            $session.destroy();
        }

        // Run function after session destroy
        if (typeof options.afterSessionDestroy == 'function') {
            options.afterSessionDestroy();
        }

        if (options && typeof options.redirect == 'function') {
            return options.redirect(url.href);
        }

        return url.href;
    }

    private async prepare(): Promise<void> {
        await this.getDiscovery();
        await this.getJwks();
    }

    private static getFlowType(options: IDigitalOptions) {
        switch (options.flowType) {
            case FlowType.AuthorizationCode:
                return IDigitalAuthorizationCode;
            case FlowType.Implicit:
                return IDigitalAuthorizationCode;
            default: {
                const message = MESSAGES.INVALID_FLOW_TYPE;
                throw new Error(message);
            }
        }
    }
}
