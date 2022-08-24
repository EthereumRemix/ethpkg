/// <reference types="node" />
import { IPackage, IPackageEntry } from './IPackage';
export default class TarPackage implements IPackage {
    private packagePath;
    private isGzipped;
    tarbuf?: Buffer;
    constructor(packagePath?: string, compressed?: boolean);
    loadBuffer(buf: Buffer): Promise<void>;
    private getReadStream;
    private getEntryData;
    getEntries(): Promise<IPackageEntry[]>;
    getEntry(relativePath: string): Promise<IPackageEntry | null>;
    addEntry(relativePath: string, content: string | Buffer): Promise<string>;
    toBuffer(): Promise<Buffer>;
    writePackage(outPath: string): Promise<string>;
}
