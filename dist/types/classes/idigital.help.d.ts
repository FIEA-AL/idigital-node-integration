/// <reference types="node" />
import { IDigitalOptions } from '../interfaces/idigital';
export default class IDigitalHelp {
    static applyVerboseMode(data: any, options: IDigitalOptions): void;
    static getParameterizedUrl(url: string, params: Array<[string, string]>): URL;
    static isJWT(input: string): boolean;
    static getRequestParams(request: any): any;
    static getRandomBytes(bytes: number, options: IDigitalOptions): string;
    static getPkceKeysPair(options: IDigitalOptions): {
        codeVerifier: string;
        codeChallenge: string;
    };
    static getBase64Encoded(input: any, encoding?: BufferEncoding): string;
    static getBase64Decoded(input: any): string;
}
