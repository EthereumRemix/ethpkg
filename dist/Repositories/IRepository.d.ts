/// <reference types="node" />
import { StateListener } from '../IStateListener';
import { IPackage } from '../PackageManager/IPackage';
export interface FetchOptions {
    filter?: (release: IRelease) => boolean;
    filterInvalid?: boolean;
    packagesOnly?: boolean;
    sort?: boolean;
    version?: string;
    prefix?: string;
    timeout?: number;
    skipCache?: boolean;
    cache?: string | Array<string>;
    cacheOnly?: boolean;
    preferCache?: boolean;
    pagination?: boolean | number;
    limit?: number;
    listener?: StateListener;
}
export interface PublishOptions {
    listener?: StateListener;
}
export interface IRelease {
    name?: string;
    version?: string;
    displayVersion?: string;
    channel?: string;
    fileName: string;
    updated_ts?: number;
    updated_at?: string;
    size?: number;
    original?: any;
    error?: string;
    location?: string;
    remote?: boolean;
    signature?: string;
}
export declare function instanceOfIRelease(obj: any): obj is IRelease;
export interface Credentials {
    username?: string;
    password?: string;
    privateKey?: Buffer;
}
export interface RepositoryConfig {
    name?: string;
    owner?: string;
    project?: string;
}
export interface IRepository {
    readonly name: string;
    login?: (credentials: Credentials) => Promise<boolean>;
    listReleases(options?: FetchOptions): Promise<Array<(IRelease)>>;
    publish?: (pkg: IPackage, options?: PublishOptions) => Promise<IRelease>;
}
