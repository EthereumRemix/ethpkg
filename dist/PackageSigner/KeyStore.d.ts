/// <reference types="node" />
import { KeyFileInfo } from './KeyFileInfo';
import { StateListener } from '../IStateListener';
export interface GetKeyOptions {
    keyStore?: string;
    password?: string | PasswordCallback;
    listener?: StateListener;
    alias?: string;
    create?: boolean;
    selectKeyCallback?: (keys: Array<KeyFileInfo>) => Promise<KeyFileInfo>;
}
export interface CreateKeyOptions {
    password?: string | PasswordCallback;
    alias?: string;
    listener?: StateListener;
}
export declare const getPrivateKeyFromKeyfile: (keyfilePath: string, password: string) => Promise<string>;
export declare type PasswordCallback = (options: any) => Promise<string> | string;
export declare const getPassword: (password: string | PasswordCallback | undefined, key?: KeyFileInfo | undefined) => Promise<string>;
export default class KeyStore {
    keystorePath: string;
    constructor(keystorePath?: string);
    listKeys(filterEthpkgKeys?: boolean): Promise<KeyFileInfo[]>;
    hasKey(keyInfo: string): Promise<boolean>;
    getKeyByAddress(address: string): Promise<KeyFileInfo | undefined>;
    getKeyByAlias(alias: string): Promise<Array<KeyFileInfo>>;
    static isKeyfile(keyPath: string): Promise<boolean>;
    getKey({ password, listener, alias, create, selectKeyCallback }?: GetKeyOptions): Promise<Buffer>;
    unlockKey(addressOrKey: string | KeyFileInfo, password: string, listener?: StateListener): Promise<string>;
    createKey({ password, alias, listener }?: CreateKeyOptions): Promise<{
        info: KeyFileInfo;
        key: any;
    }>;
}
