declare class _Logger {
    info(message: string, data?: any): void;
    error(message: string, data?: any): void;
    warning(message: string, data?: any): void;
}
export declare const logger: _Logger;
export {};
