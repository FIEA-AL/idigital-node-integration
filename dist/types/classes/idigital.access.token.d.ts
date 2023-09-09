import { AccessToken, AccessTokenHeader, AccessTokenPayload } from '../interfaces/access.token';
import { IDigitalOptions } from '../interfaces/idigital';
import IDigitalToken from './idigital.token';
export default class IDigitalAccessToken extends IDigitalToken {
    readonly payload: AccessTokenPayload;
    readonly header: AccessTokenHeader;
    protected constructor(token: string, jwt: AccessToken);
    static verify(token?: string, keys?: any, options?: IDigitalOptions): Promise<IDigitalAccessToken>;
}
