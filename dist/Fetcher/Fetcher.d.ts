/// <reference types="node" />
import { IRelease, FetchOptions } from '../Repositories/IRepository';
import { StateListener } from '../IStateListener';
import RepositoryManager from '../Repositories/RepositoryManager';
export declare type PackageQuery = string;
export declare const instanceOfPackageQuery: (str: any) => str is string;
export interface DownloadPackageOptions {
    proxy?: string;
    headers?: any;
    onDownloadProgress?: (progress: number, release: IRelease) => void;
    listener?: StateListener;
    destPath?: string;
    extract?: boolean;
    verify?: boolean;
}
export interface ResolvePackageOptions extends FetchOptions, DownloadPackageOptions {
    spec?: PackageQuery;
    platform?: string;
    cache?: string;
}
export declare function instanceofResolvePackageOptions(object: any): object is ResolvePackageOptions;
export default class Fetcher {
    name: string;
    repoManager: RepositoryManager;
    constructor(repoManager?: RepositoryManager);
    /**
     *
     * @param spec : PackageQuery
     * @param options : FetchOptions
     */
    private filterReleases;
    listReleases(spec: PackageQuery, { filter, filterInvalid, packagesOnly, sort, version, prefix, timeout, cache, skipCache, cacheOnly, preferCache, pagination, limit, listener }?: FetchOptions): Promise<IRelease[]>;
    getRelease(spec: PackageQuery, { listener, filter, version, platform, // FIXME this info is only implemented via filters
    prefix, timeout, skipCache, cache, pagination, limit }?: ResolvePackageOptions): Promise<IRelease | undefined>;
    downloadPackage(release: IRelease, options?: DownloadPackageOptions): Promise<Buffer>;
}
