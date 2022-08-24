export declare const listKeys: () => {
    address: string;
    'file': string;
    'filePathFull': string;
}[];
export declare const questionKeySelect: (keys: any) => {
    type: string;
    name: string;
    message: string;
    initial: string;
    choices: any;
    result(value: string): any;
}[];
export declare const getKeyFilePath: () => Promise<any>;
export declare const getPrivateKeyFromEthKeystore: () => Promise<any>;
export declare const getPrivateKeyFromEthKeyfile: (keyFile?: string | undefined, fileName?: string | undefined) => Promise<any>;
