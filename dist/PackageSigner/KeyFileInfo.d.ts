export interface KeyFileInfo {
    fileName: string;
    filePath: string;
    address?: string;
    alias?: Array<string>;
    version?: string;
    keyObj?: any;
    error?: any;
    isValid: boolean;
    type?: string;
}
