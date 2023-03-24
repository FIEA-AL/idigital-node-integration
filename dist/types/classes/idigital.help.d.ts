/// <reference types="node" />
export default class IDigitalHelp {
    static getParameterizedUrl(url: string, params: Array<[string, string]>): URL;
    static isJWT(input: string): boolean;
    static getRequestParams(request: any): any;
    static getRandomBytes(bytes?: number): string;
    static getPkceKeysPair(): {
        codeVerifier: string;
        codeChallenge: string;
    };
    static getBase64Encoded(input: any, encoding?: BufferEncoding): string;
    static getBase64Decoded(input: any): string;
}
