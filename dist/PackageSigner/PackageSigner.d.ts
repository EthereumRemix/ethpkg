/// <reference types="node" />
import { IPackage } from '../PackageManager/IPackage';
import { IVerificationResult } from '../IVerificationResult';
import { PackageData } from '../PackageManager/PackageService';
import { StateListener } from '../IStateListener';
import { ISigner } from '..';
export interface SignPackageOptions {
    expiresIn?: number;
    algorithm?: string;
    listener?: StateListener;
}
export declare type PrivateKeyInfo = string | Buffer | ISigner;
export declare type PublicKeyInfo = string;
export interface VerifyPackageOptions {
    addressOrEnsName?: PublicKeyInfo;
    listener?: StateListener;
}
export declare const isSigned: (pkgSpec: PackageData) => Promise<boolean>;
export declare const isValid: (pkgSpec: PackageData) => Promise<boolean>;
export declare const sign: (pkgSpec: PackageData, privateKey: PrivateKeyInfo, { expiresIn, listener, algorithm }?: SignPackageOptions) => Promise<IPackage>;
/**
 *
 * @param pkgSpec
 * @param publicKeyInfo
 */
export declare const verify: (pkgSpec: PackageData, { addressOrEnsName, listener }?: VerifyPackageOptions) => Promise<IVerificationResult>;
