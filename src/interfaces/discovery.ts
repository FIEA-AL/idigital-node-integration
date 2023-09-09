export interface Discovery {
    issuer: string;
    jwks_uri: string;
    token_endpoint: string;
    userinfo_endpoint?: string;
    claims_supported?: string[];
    scopes_supported?: string[];
    end_session_endpoint: string;
    authorization_endpoint: string;
    claim_types_supported?: string[];
    grant_types_supported?: string[];
    subject_types_supported?: string[];
    response_modes_supported?: string[];
    response_types_supported?: string[];
    claims_parameter_supported?: boolean;
    request_parameter_supported?: boolean;
    backchannel_logout_supported?: boolean;
    request_uri_parameter_supported?: boolean;
    require_request_uri_registration?: boolean;
    code_challenge_methods_supported?: string[];
    dpop_signing_alg_values_supported?: string[];
    backchannel_logout_session_supported?: boolean;
    id_token_signing_alg_values_supported?: string[];
    token_endpoint_auth_methods_supported?: string[];
    request_object_signing_alg_values_supported?: string[];
    authorization_response_iss_parameter_supported?: boolean;
}
