export interface IDTokenHeader {
    alg: string;
    typ?: string;
    kid?: string;
}

export interface IDTokenPayload {
    displayName?: string;
    middleName?: string;
    familyName?: string;
    givenName?: string;
    auth_time: number;
    document?: string;
    at_hash: string;
    email?: string;
    nonce: string;
    sub: string;
    aud: string;
    exp: number;
    iat: number;
    iss: string;
}

export interface IDToken {
    payload: IDTokenPayload;
    header: IDTokenHeader;
}
