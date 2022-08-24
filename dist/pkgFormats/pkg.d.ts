/// <reference types="node" />
import { IPackage } from './IPackage';
import ZipPackage from './ZipPackage';
export declare class pkg {
    static isPackage(): boolean;
    static create: (pkgDirPath: string, pkgOutPath?: string | undefined) => Promise<ZipPackage>;
    static getPackage: (pkgSrc: string | Buffer) => Promise<IPackage>;
}
