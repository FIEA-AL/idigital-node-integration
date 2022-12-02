import { IAccessToken, IAccessTokenHeader, IAccessTokenPayload } from "@interfaces/access.token";
import { IDigitalToken } from "./idigital.token.js";
import { IIDigital } from "@interfaces/idigital";
export declare class IDigitalAccessToken extends IDigitalToken {
    readonly payload: IAccessTokenPayload;
    readonly header: IAccessTokenHeader;
    protected constructor(token: string, jwt: IAccessToken);
    static verify(token?: string, keys?: any, options?: IIDigital): Promise<IDigitalAccessToken>;
}
