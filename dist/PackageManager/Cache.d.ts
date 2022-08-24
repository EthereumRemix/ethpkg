/// <reference types="node" />
import { ISerializable, SerializationInfo } from './ISerializable';
export declare const md5: (data: string | Buffer) => string;
export declare abstract class ICache<T extends ISerializable> {
    abstract put(key: string, obj: T | undefined | any): Promise<string>;
    abstract has(key: string): Promise<boolean>;
    abstract get(key: string): Promise<T | undefined>;
    abstract clear(): Promise<void>;
}
export declare function instanceOfICache(obj: any): obj is ICache<any>;
export declare function withCache<T extends ISerializable>(cache: ICache<T>, fn: (...args: any) => Promise<T | undefined | any>, keyFn?: (...args: any) => string): any;
export declare class MemCache<T extends ISerializable> extends ICache<T> {
    private cache;
    constructor();
    put(key: string, obj: T | undefined | any): Promise<string>;
    keys(): Array<string>;
    has(key: string): Promise<boolean>;
    get(key: string): Promise<any>;
    clear(): Promise<void>;
}
export declare class PersistentJsonCache<T extends ISerializable> extends ICache<T> {
    private dirPath;
    ctor: Function;
    constructor(dirPath: string, ctor: (info: SerializationInfo) => Promise<T | undefined>);
    private keyToFilepath;
    put(key: string, obj: T | undefined | any): Promise<string>;
    has(key: string): Promise<boolean>;
    get<T>(key: string): Promise<T | undefined>;
    clear(): Promise<void>;
}
export declare class NoCache<T extends ISerializable> extends ICache<T> {
    put(key: string, obj: T | undefined): Promise<string>;
    has(key: string): Promise<boolean>;
    get(key: string): Promise<T | undefined>;
    clear(): Promise<void>;
}
