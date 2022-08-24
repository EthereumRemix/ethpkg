/// <reference types="node" />
import { IPackage } from '../PackageManager/IPackage';
import { IFile } from '../PackageManager/IPackage';
export declare const compareVersions: (a: {
    version?: string | undefined;
    channel?: string | undefined;
}, b: {
    version?: string | undefined;
    channel?: string | undefined;
}) => 1 | 0 | -1;
export declare const compareDate: ({ updated_ts: a }: {
    updated_ts?: number | undefined;
}, { updated_ts: b }: {
    updated_ts?: number | undefined;
}) => 1 | 0 | -1;
export declare const multiSort: (fn1: Function, fn2: Function) => (a: any, b: any) => any;
export declare const datestring: (d: number | Date) => string;
/**
 * there ar emultiple ways how files are addressed inside packages
 * some tools and modules create absolute paths, some prefix with ./ or omit
 * therefore we need to compare all possible options to test for "equality"
 */
export declare const relativePathEquals: (path1: string, path2: string) => boolean;
export declare const normalizeRelativePath: (s: string) => string;
export declare const toIFile: (relPath: string, content: string | Buffer) => IFile;
export declare const toFile: (relPath: string, content: string | Buffer) => IFile;
export declare const writeEntry: (pkg: IPackage, relPath: string, content: string) => Promise<void>;
