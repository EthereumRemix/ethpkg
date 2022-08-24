/// <reference types="node" />
declare const _default: {
    sign: (payload: any, signerOrPrivateKey: import("../IExternalSigner").default | Buffer, _header?: any) => Promise<{
        protected: string;
        payload: any;
        signature: string;
    }>;
};
export default _default;
