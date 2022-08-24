export declare const SIGNING_METHOD: {
    [index: string]: string;
};
export declare const KEY_STORAGE: {
    [index: string]: string;
};
export declare const getSingingMethod: (fileName?: string | undefined) => Promise<any>;
export declare const getKeyLocation: () => Promise<any>;
export declare const getExternalSigner: () => Promise<any>;
/**
 export const getPrivateKeyFromPemFile = async () => {
  const keyFilePath = await getUserFilePath('Provide path to pem keyfile')
  const privateKey = getPrivateKeyFromPEM(keyFilePath)
  return privateKey
}
 */
export declare const getPrivateKey: (options: any) => Promise<any>;
