import { IIDToken, IIDTokenHeader, IIDTokenPayload } from "@interfaces/id.token";
import { IDigitalToken } from "./idigital.token.js";
import { IIDigital } from "@interfaces/idigital";
export declare class IDigitalIDToken extends IDigitalToken {
    readonly payload: IIDTokenPayload;
    readonly header: IIDTokenHeader;
    protected constructor(token: string, jwt: IIDToken);
    static verify(token?: string, keys?: any, nonce?: any, options?: IIDigital): Promise<IDigitalIDToken>;
}
