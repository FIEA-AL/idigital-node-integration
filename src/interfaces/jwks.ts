export interface JWKSKey {
    alg: string;
    kid: string;
    kty: string;
    use: string;
    e: string;
    n: string;
}

export interface JWKS {
    keys: JWKSKey[];
}
