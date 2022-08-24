import { KeyFileInfo } from '../PackageSigner/KeyFileInfo';
export declare const getUserFilePath: (message: string, filePath?: string | undefined) => Promise<string | undefined>;
export declare const getCredentialsFromUser: ({}?: {}) => Promise<{
    username: any;
    password: any;
}>;
export declare const getPasswordFromUser: ({ repeat, keyName }?: {
    repeat?: boolean | undefined;
    keyName?: string | undefined;
}) => Promise<any>;
export declare const getSelectedKeyFromUser: (keys: KeyFileInfo[]) => Promise<any>;
