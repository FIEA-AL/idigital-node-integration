export interface AccessTokenHeader {
    alg: string;
    typ?: string;
    kid?: string;
}

export interface AccessTokenPayload {
    client_id: string;
    scope: string;
    aud: string;
    iat: number;
    exp: number;
    iss: string;
    jti: string;
    sub: string;
}

export interface AccessToken {
    payload: AccessTokenPayload;
    header: AccessTokenHeader;
}
