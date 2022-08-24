/// <reference types="node" />
import { IPackage, IPackageEntry } from './IPackage';
export default class ZipPackage implements IPackage {
    private zip;
    constructor();
    init(): void;
    loadBuffer(buf: Buffer): Promise<void>;
    getEntries(): Promise<Array<IPackageEntry>>;
    getEntry(relativePath: string): Promise<IPackageEntry | null>;
    addEntry(relativePath: string, content: string | Buffer): Promise<string>;
    toBuffer(): Promise<Buffer>;
    writePackage(filePath: string, useCompression?: boolean): Promise<string>;
}
