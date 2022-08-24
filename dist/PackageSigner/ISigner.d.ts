/// <reference types="node" />
export default interface ISigner {
    type: string;
    name: string;
    ecSign?: (msg: Buffer) => Promise<Buffer>;
    ethSign?: (msg: Buffer) => Promise<Buffer>;
    getAddress: () => Promise<string>;
}
export declare function instanceofISigner(object: any): object is ISigner;
