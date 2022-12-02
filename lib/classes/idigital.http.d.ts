import { ICallbackResponse } from "@interfaces/callback";
import { IDiscovery } from "@interfaces/discovery";
export declare class IDigitalHttp {
    private static WWW_FORM_TYPE;
    private static JSON_TYPE;
    static getDiscovery(url: string): Promise<IDiscovery>;
    static getJwks(url: string): Promise<any>;
    static getTokens(url: string, data: any): Promise<ICallbackResponse>;
    private static get;
    private static post;
}
