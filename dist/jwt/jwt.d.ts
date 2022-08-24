/// <reference types="node" />
import * as JWS from '../jws';
interface SignOptions {
    algorithm?: string;
    keyid?: string;
    expiresIn?: string | number;
    issuer?: string;
    header?: object;
}
interface VerifyOptions {
    algorithms?: string[];
    issuer?: string | string[];
    subject?: string;
}
export declare const sign: (payload: string | object | Buffer, secretOrPrivateKey: Buffer, options?: SignOptions | undefined) => Promise<{
    protected: string;
    payload: any;
    signature: string;
}>;
export declare type Secret = string | Buffer | {
    key: string | Buffer;
    passphrase: string;
};
/**
 * Asynchronously verify given token using a secret or a public key to get a decoded token
 * token - JWT string to verify
 * secretOrPublicKey - Either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA.
 * [options] - Options for the verification
 * returns - The decoded token.
 */
export declare const verify: (token: string, secretOrPublicKey: string | Buffer, options?: VerifyOptions | undefined) => Promise<string | object>;
export declare const decode: (token: JWS.IFlattenedJwsSerialization) => any;
export {};
