export default class IDigitalToken {
    readonly token: string;
    readonly payload: any;
    readonly header: any;
    protected constructor(token: string, jwt: any);
    protected static getHeader(token?: string, typ?: string): any;
    protected static getPayload(token?: string): any;
    protected static getSignature(token?: string): any;
    protected static isNotJWT(): void;
    protected static getPublicKeyByKid(kid?: string, alg?: string, keys?: any): any;
    protected static verifyIssuer(value1?: string, value2?: string): void;
    protected static verifyClient(value1?: string, value2?: string): void;
    protected static verifyAudience(value1?: string, value2?: string): void;
    protected static verifyNonce(value1?: string, value2?: string): void;
    private static verifyAttributesOfJWT;
    private static getData;
}
