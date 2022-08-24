/// <reference types="node" />
import ISigner from "../PackageSigner/ISigner";
/**
 * WARNING: Use of the Geth signer to sign packages is discouraged!
 * This is mainly used for testing & to be able to compare the results of different client implementations
 */
export default class GethSigner implements ISigner {
    name: string;
    type: string;
    address: string;
    id: number;
    rpcApi: string;
    constructor(address: string, rpc?: string);
    getAddress(): Promise<string>;
    ecSign(msg: Buffer): Promise<Buffer>;
    ethSign(msg: Buffer): Promise<Buffer>;
}
