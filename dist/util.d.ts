/// <reference types="node" />
import fs from 'fs';
import stream from 'stream';
import { IPackage, IFile } from './PackageManager/IPackage';
import { StateListener } from './IStateListener';
export declare const getDefaultDataDir: () => string;
export declare function parseXml(xml: string | Buffer): Promise<unknown>;
export declare const formatBytes: (bytes: number) => string;
export declare const isDirPath: (str: string) => boolean;
export declare const isFilePath: (str: string | undefined) => boolean | "" | undefined;
export declare const isDirSync: (filePath: string | undefined) => boolean;
export declare const isFileSync: (filePath: string | undefined) => boolean;
export declare const extractPackage: (pkg: IPackage, destPath: string, listener?: StateListener) => Promise<string>;
export declare function runScriptSync(scriptName: string, scriptArgs: any, cwd?: any): any;
export declare function runScript(scriptName: string, scriptArgs: any, cwd?: any): Promise<any>;
export declare const downloadNpmPackage: (moduleName: string) => Promise<string | null>;
export declare const streamToBuffer: (stream: stream.Readable, size?: number | undefined) => Promise<Buffer>;
export declare const streamPromise: (stream: stream.Writable | fs.WriteStream) => Promise<string>;
export declare const bufferToStream: (buf: Buffer) => stream.Readable;
export declare const isUrl: (str: string) => boolean;
export declare const localFileToIFile: (filePath: string) => IFile;
export declare type ConstructorOf<T> = new (...args: any[]) => T;
export declare const deleteFolderRecursive: (dirPath: string) => void;
export declare const is: {
    browser: () => boolean;
};
export declare const sleep: (t?: number) => Promise<unknown>;
