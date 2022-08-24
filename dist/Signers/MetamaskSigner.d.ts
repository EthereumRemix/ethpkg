/// <reference types="node" />
import ISigner from '../PackageSigner/ISigner';
export default class MetamaskSigner implements ISigner {
    name: string;
    type: string;
    getAddress(retry?: boolean): Promise<string>;
    ecSign(msg: Buffer): Promise<Buffer>;
    metamaskEthSign(msg: string, from: string): Promise<string | undefined>;
    ethSign(msg: Buffer): Promise<Buffer>;
}
