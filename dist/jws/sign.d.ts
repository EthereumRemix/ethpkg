/// <reference types="node" />
import IExternalSigner from '../IExternalSigner';
declare const _default: (payload: any, signerOrPrivateKey: IExternalSigner | Buffer, _header?: any) => Promise<{
    protected: string;
    payload: any;
    signature: string;
}>;
export default _default;
