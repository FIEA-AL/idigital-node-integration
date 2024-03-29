export const MESSAGES = {
    REQUIRED_SESSION: 'O uso de sessão é obrigatório.',
    INVALID_JWT: 'O token em análise não é um JWT válido.',
    DIVERGENT_CLIENT_ID: 'O ID do cliente não pertence ao servidor.',
    INVALID_FLOW_TYPE: 'O fluxo de autorização selecionado não existe.',
    DIVERGENT_NONCE: 'A propriedade nonce enviada difere da armazenada.',
    DIVERGENT_STATE: 'A propriedade state enviada difere da armazenada.',
    DIVERGENT_ISSUER: 'A propriedade issuer enviada difere da armazenada.',
    COULD_NOT_GENERATE_PKCE: 'O servidor não conseguiu gerar as chaves PKCE.',
    DIVERGENT_AUDIENCE: 'A propriedade audience enviada difere da armazenada.',
    JWT_WITHOUT_ALG: 'O JWT não possui uma propriedade alg válida no cabeçalho.',
    JWT_WITHOUT_KID: 'O JWT não possui uma propriedade kid válida no cabeçalho.',
    JWT_WITHOUT_TYP: 'O JWT não possui uma propriedade typ válida no cabeçalho.',
    COULD_NOT_GENERATE_BYTES: 'O servidor não conseguiu gerar valores aleatórios.',
    HTTP_ERROR: 'Não foi possível realizar a requisição para o servidor de destino.',
    COULD_NOT_FIND_PUBLIC_KEYS: 'O servidor não conseguiu encontrar chaves públicas.',
    INVALID_CALLBACK_REQUEST_PARAMS: 'Os parâmetros da função de retorno são inválidos. ',
    PASSPORT_CALLBACK_TYPE: 'O callback de verificação do Passport.js deve ser uma função.',
};
//# sourceMappingURL=messages.const.js.map