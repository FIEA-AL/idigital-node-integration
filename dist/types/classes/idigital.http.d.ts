import { TokenResponse } from "../interfaces/tokens";
import { Discovery } from "../interfaces/discovery";
export default class IDigitalHttp {
    private static WWW_FORM_TYPE;
    private static JSON_TYPE;
    static getDiscovery(url: string): Promise<Discovery>;
    static getJwks(url: string): Promise<any>;
    static getTokens(url: string, data: any): Promise<TokenResponse>;
    private static get;
    private static post;
}
