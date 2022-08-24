/// <reference types="node" />
import fs from 'fs';
import stream from 'stream';
export declare const getKeystorePath: () => string;
export declare const getPrivateKeyFromKeystore: (keyFile: string, keyFilePassword?: string | undefined) => Promise<any>;
export declare const getPrivateKeyFromPEM: (inputPath: string) => any;
export declare function runScriptSync(scriptName: string, scriptArgs: any, cwd?: any): any;
export declare function runScript(scriptName: string, scriptArgs: any, cwd?: any): Promise<any>;
export declare const downloadNpmPackage: (moduleName: string) => Promise<string | null>;
export declare const streamToBuffer: (stream: fs.ReadStream, size?: number | undefined) => Promise<Buffer>;
export declare const bufferToStream: (buf: Buffer) => stream.Readable;
