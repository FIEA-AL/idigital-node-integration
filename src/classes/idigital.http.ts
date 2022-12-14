import { IDigitalException } from "@errors/idigital.exception";
import { ICallbackResponse } from "@interfaces/callback";
import { IDiscovery } from "@interfaces/discovery";
import { MESSAGES } from "@errors/messages.const";
import * as https from "https";
import axios from 'axios';

const axiosInstance = axios.create({
	httpsAgent: new https.Agent({
		rejectUnauthorized: false,
	})
});

export class IDigitalHttp {
	private static WWW_FORM_TYPE: string = 'application/x-www-form-urlencoded';
	private static JSON_TYPE: string = 'application/json';

	public static getDiscovery(url: string): Promise<IDiscovery> {
		return this.get(url);
	}

	public static getJwks(url: string): Promise<any> {
		return this.get(url);
	}

	public static async getTokens(url: string, data: any): Promise<ICallbackResponse> {
		return this.post(url, data);
	}

	private static get(url: string): Promise<any> {
		const headers = { 'Content-Type': this.JSON_TYPE };
		return axiosInstance.get(url, { headers })
			.then(response => response.data)
			.catch(() => {
				const message = MESSAGES.HTTP_ERROR;
				throw new IDigitalException(500, message);
			});
	}

	private static post(url: string, data: any): Promise<any> {
		const headers = { 'Content-Type': this.WWW_FORM_TYPE };
		return axiosInstance.post(url, data, { headers })
			.then(response => response.data)
			.catch(() => {
				const message = MESSAGES.HTTP_ERROR;
				throw new IDigitalException(500, message);
			});
	}
}
