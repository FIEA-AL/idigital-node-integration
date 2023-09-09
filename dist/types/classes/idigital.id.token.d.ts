import { IDToken, IDTokenHeader, IDTokenPayload } from '../interfaces/id.token';
import { IDigitalOptions } from '../interfaces/idigital';
import IDigitalToken from './idigital.token';
export default class IDigitalIDToken extends IDigitalToken {
    readonly payload: IDTokenPayload;
    readonly header: IDTokenHeader;
    protected constructor(token: string, jwt: IDToken);
    static verify(token?: string, keys?: any, nonce?: any, options?: IDigitalOptions): Promise<IDigitalIDToken>;
}
