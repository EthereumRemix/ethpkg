/// <reference types="node" />
import { IPackage } from '../PackageManager/IPackage';
import { IRelease } from '../Repositories/IRepository';
export declare type PackageData = IPackage | Buffer | File | string;
export declare function instanceOfPackageData(obj: any): obj is PackageData;
export declare const getPackageFromFile: (pkgSrc: string) => Promise<IPackage>;
export declare const toPackage: (pkgSpec: PackageData, release?: IRelease | undefined) => Promise<IPackage>;
