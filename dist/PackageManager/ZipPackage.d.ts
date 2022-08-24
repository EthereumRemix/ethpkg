/// <reference types="node" />
import { IPackage, IPackageEntry, IFile, CreatePackageOptions, WritePackageOptions, ExtractPackageOptions } from './IPackage';
import { IRelease } from '../Repositories/IRepository';
export default class ZipPackage implements IPackage {
    type: string;
    private zip;
    fileName: string;
    metadata?: IRelease;
    readonly filePath: string | undefined;
    private _size;
    constructor(packagePathOrName: string);
    init(): this;
    get size(): number;
    private tryLoad;
    loadBuffer(buf: Buffer): Promise<IPackage>;
    getEntries(): Promise<Array<IPackageEntry>>;
    getEntry(relativePath: string): Promise<IPackageEntry | undefined>;
    getContent(relativePath: string): Promise<Buffer>;
    addEntry(relativePath: string, file: IFile | string | Buffer): Promise<string>;
    toBuffer(): Promise<Buffer>;
    getObjectData(): Promise<any>;
    extract(destPath: string, { listener }?: ExtractPackageOptions): Promise<string>;
    writePackage(outPath: string, { overwrite, compression }?: WritePackageOptions): Promise<string>;
    static create(dirPathOrName: string, { listener }?: CreatePackageOptions): Promise<ZipPackage>;
    static from(packagePath: string): Promise<IPackage>;
}
