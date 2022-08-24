/// <reference types="node" />
import ISigner from '../PackageSigner/ISigner';
import { IEthJWK } from '../jwk';
export interface IFlattenedJwsSerialization {
    header?: any;
    protected?: string;
    payload: string | any;
    signature: string;
}
interface VerifyOptions {
    algorithms?: string[];
    issuer?: string | string[];
    subject?: string;
}
export declare const safeStringify: (payload: any) => string;
export declare const ecRecover: (signatureHexStr: string, msg: string, scheme?: string) => Promise<string>;
export declare type Secret = string | Buffer | {
    key: string;
    passphrase: string;
};
export declare const ALGORITHMS: {
    'EC_SIGN': string;
    'ETH_SIGN': string;
};
export interface CreateHeaderOptions {
    algorithm: string;
    address: string;
}
/**
 * Create the JSON object(s) containing the desired set of Header Parameters,
 * which together comprise the JOSE Header (the JWS Protected Header and/or the JWS Unprotected Header).
 */
export declare const createHeader: (options: CreateHeaderOptions) => {
    'typ': string;
    alg: string;
    b64: boolean;
    crit: string[];
    jwk: IEthJWK;
};
export declare const sign: (payload: any, signerOrPrivateKey: Buffer | ISigner, header?: any) => Promise<{
    protected: string;
    payload: any;
    signature: string;
}>;
export declare const decode: (token: IFlattenedJwsSerialization) => Promise<{
    header: any;
    protected: string;
    payload: any;
    signature: string;
}>;
export declare const recoverAddress: (encodedToken: IFlattenedJwsSerialization) => Promise<string>;
export declare const verify: (token: IFlattenedJwsSerialization, secretOrPublicKey?: string | Buffer | undefined, options?: VerifyOptions | undefined) => Promise<IFlattenedJwsSerialization>;
export {};
