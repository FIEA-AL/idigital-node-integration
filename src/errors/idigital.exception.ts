import { HTTP_STATUS } from "@consts/http.status";

export default class IDigitalException extends Error {
	public message: string;
	public status: number;
	public name: string;
	public date: string;

	constructor(status: number, message: string) {
		super(message);
		this.status = status;
		this.message = message;
		this.name = HTTP_STATUS[status];
		this.date = new Date().toLocaleString();
	}
}
