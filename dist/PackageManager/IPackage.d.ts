/// <reference types="node" />
import { IRelease } from '../Repositories/IRepository';
import { ISerializable } from './ISerializable';
import { StateListener } from '../IStateListener';
export interface WritePackageOptions {
    overwrite?: boolean;
    compression?: boolean;
}
export interface CreatePackageOptions {
    compressed?: boolean;
    listener?: StateListener;
}
export interface ExtractPackageOptions {
    listener?: StateListener;
}
export interface IPackage extends ISerializable {
    fileName: string;
    filePath?: string;
    metadata?: IRelease;
    size: number;
    loadBuffer(buf: Buffer): Promise<IPackage>;
    getEntries(): Promise<Array<IPackageEntry>>;
    getEntry(relativePath: string): Promise<IPackageEntry | undefined>;
    getContent(relativePath: string): Promise<Buffer>;
    addEntry(relativePath: string, file: IFile | string | Buffer): Promise<string>;
    toBuffer(): Promise<Buffer>;
    writePackage(outPath: string, options?: WritePackageOptions): Promise<string>;
    extract(destPath: string, options?: ExtractPackageOptions): Promise<string>;
}
export declare function instanceofIPackage(object: any): object is IPackage;
export interface IFile {
    name: string;
    size: number;
    mode?: number;
    isDir: boolean;
    readContent: (format?: string) => Promise<Buffer>;
}
export interface IPackageEntry {
    relativePath: string;
    file: IFile;
}
