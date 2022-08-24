/// <reference types="node" />
import { IFlattenedJwsSerialization } from "../IJWS";
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
declare const _default: {
    sign: (payload: string | object | Buffer, secretOrPrivateKey: Buffer, options?: SignOptions | undefined) => Promise<{
        protected: string;
        payload: any;
        signature: string;
    }>;
    verify: (token: string | IFlattenedJwsSerialization, secretOrPublicKey: string | Buffer, options?: VerifyOptions | undefined) => Promise<string | object>;
    decode: (token: IFlattenedJwsSerialization) => any;
};
export default _default;
