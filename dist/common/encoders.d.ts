export declare function encodeBase64(input: string): string;
export declare function decodeBase64(encoded: string): string;
export declare function hashPassword(password: string, saltRound: number | 12): Promise<string>;
