/// <reference types="node" />
import ISigner from '../PackageSigner/ISigner';
export default class PrivateKeySigner implements ISigner {
    name: string;
    type: string;
    private _privateKey;
    constructor(privateKey: Buffer);
    getAddress(): Promise<string>;
    ecSign(msg: Buffer): Promise<Buffer>;
    ethSign(msg: Buffer): Promise<Buffer>;
}
