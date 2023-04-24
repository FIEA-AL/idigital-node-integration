import { IDigitalOptions } from "../interfaces/idigital";
import { TokenResponse } from "../interfaces/tokens";
import { Discovery } from "../interfaces/discovery";
export default class IDigitalHttp {
    private static WWW_FORM_TYPE;
    private static JSON_TYPE;
    static getJwks(url: string, options: IDigitalOptions): Promise<any>;
    static getDiscovery(url: string, options: IDigitalOptions): Promise<Discovery>;
    static getTokens(url: string, data: any, options: IDigitalOptions): Promise<TokenResponse>;
    private static get;
    private static post;
}
