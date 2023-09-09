import IDigitalException from '@errors/idigital.exception';
import { IDigitalOptions } from '@interfaces/idigital';
import { TokenResponse } from '@interfaces/tokens';
import { Discovery } from '@interfaces/discovery';
import { MESSAGES } from '@errors/messages.const';
import IDigitalHelp from './idigital.help';
import axios from 'axios';

const axiosInstance = axios.create();

export default class IDigitalHttp {
    private static WWW_FORM_TYPE: string = 'application/x-www-form-urlencoded';
    private static JSON_TYPE: string = 'application/json';

    public static getJwks(url: string, options: IDigitalOptions): Promise<any> {
        return this.get(url, options);
    }

    public static getDiscovery(url: string, options: IDigitalOptions): Promise<Discovery> {
        return this.get(url, options);
    }

    public static async getTokens(url: string, data: any, options: IDigitalOptions): Promise<TokenResponse> {
        return this.post(url, data, options);
    }

    private static get(url: string, options: IDigitalOptions): Promise<any> {
        const headers = { 'Content-Type': this.JSON_TYPE };
        return axiosInstance
            .get(url, { headers })
            .then((response) => response.data)
            .catch((e) => {
                IDigitalHelp.applyVerboseMode(e, options);
                throw new IDigitalException(500, MESSAGES.HTTP_ERROR);
            });
    }

    private static post(url: string, data: any, options: IDigitalOptions): Promise<any> {
        const headers = { 'Content-Type': this.WWW_FORM_TYPE };
        return axiosInstance
            .post(url, data, { headers })
            .then((response) => response.data)
            .catch((e) => {
                IDigitalHelp.applyVerboseMode(e, options);
                throw new IDigitalException(500, MESSAGES.HTTP_ERROR);
            });
    }
}
