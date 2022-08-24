/// <reference types="node" />
import { IPackage } from './IPackage';
import { IRelease, FetchOptions, IRepository, Credentials, RepositoryConfig } from '../Repositories/IRepository';
import { ResolvePackageOptions, PackageQuery } from '../Fetcher/Fetcher';
import { IVerificationResult } from '../IVerificationResult';
import ISigner from '../PackageSigner/ISigner';
import { PackageData } from './PackageService';
import { ICache } from './Cache';
import { ISerializable } from './ISerializable';
import { ConstructorOf } from '../util';
import { StateListener } from '../IStateListener';
import { GetKeyOptions } from '../PackageSigner/KeyStore';
import { SignPackageOptions, VerifyPackageOptions } from '../PackageSigner';
import { KeyFileInfo } from '../PackageSigner/KeyFileInfo';
export interface PackOptions {
    type?: string;
    listener?: StateListener;
    filePath?: string;
    fileName?: string;
    compressed?: boolean;
    overwrite?: boolean;
}
export interface PublishOptions {
    repository?: string | RepositoryConfig;
    listener?: StateListener;
    signPackage?: boolean;
    keyInfo?: GetKeyOptions;
    credentials?: Credentials;
}
export interface PackageManagerOptions {
    cache?: string | ICache<ISerializable>;
}
export default class PackageManager {
    private cache;
    private repoManager;
    private signerManager;
    constructor(options?: PackageManagerOptions);
    info(): string;
    addRepository(name: string, repo: ConstructorOf<IRepository>): Promise<void>;
    getRepository(name: string): Promise<IRepository | undefined>;
    listRepositories(): Promise<Array<string>>;
    removeRepository(name: string): Promise<boolean>;
    clearCache(): Promise<void>;
    createPackage(srcDirPathOrName: string, { type, listener, filePath, fileName, compressed, overwrite }?: PackOptions): Promise<IPackage>;
    listPackages(spec: PackageQuery, options?: FetchOptions): Promise<Array<IRelease>>;
    resolve(spec: PackageQuery, options?: ResolvePackageOptions): Promise<IRelease | undefined>;
    /**
     * Downloads a package to disk
     * A combination of resolve, fetchPackage and verify. Steps can be specified through download options
     */
    private downloadPackage;
    /**
     * Creates and returns an IPackage based on a filepath, url, or package specifier
     */
    getPackage(pkgSpec: IRelease | PackageData | PackageQuery | ResolvePackageOptions, options?: ResolvePackageOptions): Promise<IPackage | undefined>;
    /**
     * Helps to select or create a designated signing key
     // path where to search for keys
     */
    getSigningKey(options?: GetKeyOptions): Promise<Buffer>;
    listKeys(): Promise<KeyFileInfo[]>;
    addSigner(name: string, signer: ISigner): Promise<void>;
    listSigners(): Promise<Array<string>>;
    getSigner(name: string): Promise<ISigner | undefined>;
    /**
     * Signs a package or directory
     */
    signPackage(pkg: PackageData, privateKey: Buffer | ISigner, options?: SignPackageOptions): Promise<IPackage>;
    verifyPackage(pkg: PackageData, options?: VerifyPackageOptions): Promise<IVerificationResult>;
    /**
     *
     */
    publishPackage(pkgSpec: string | PackageData, { repository, listener, signPackage, keyInfo, credentials }?: PublishOptions): Promise<IRelease>;
}
