export declare class IDigitalException extends Error {
    message: string;
    status: number;
    name: string;
    date: string;
    constructor(status: number, message: string);
}
