/// <reference types="node" />
import { IPackage, IPackageEntry, IFile, WritePackageOptions, CreatePackageOptions, ExtractPackageOptions } from './IPackage';
import { IRelease } from '../Repositories/IRepository';
export default class TarPackage implements IPackage {
    fileName: string;
    metadata?: IRelease | undefined;
    filePath: string;
    isGzipped: boolean;
    tarbuf?: Buffer;
    constructor(packagePathOrName: string, compressed?: boolean);
    get size(): number;
    init(): void;
    loadBuffer(buf: Buffer): Promise<IPackage>;
    private getReadStream;
    private processTar;
    private getEntryData;
    getEntries(): Promise<IPackageEntry[]>;
    getEntry(relativePath: string): Promise<IPackageEntry | undefined>;
    getContent(relativePath: string): Promise<Buffer>;
    addEntry(relativePath: string, file: IFile | string | Buffer): Promise<string>;
    toBuffer(): Promise<Buffer>;
    getObjectData(): Promise<any>;
    writePackage(outPath: string, { overwrite, compression }?: WritePackageOptions): Promise<string>;
    extract(destPath: string, { listener }?: ExtractPackageOptions): Promise<string>;
    printPackageInfo(): Promise<void>;
    static create(dirPathOrName: string, { compressed, listener }?: CreatePackageOptions): Promise<TarPackage>;
    static from(packagePath: string): Promise<IPackage>;
}
