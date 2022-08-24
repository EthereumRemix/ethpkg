/// <reference types="node" />
import { IPackage, IPackageEntry } from '../PackageManager/IPackage';
import { IVerificationResult, ISignerInfo } from '../IVerificationResult';
import * as jws from '../jws';
import { StateListener } from '../IStateListener';
import { ISigner } from '..';
export declare type PrivateKeyInfo = string | Buffer | ISigner;
export declare type PublicKeyInfo = string;
export declare const checksumsPath: (pkg: IPackage) => Promise<string>;
export interface Digests {
    [index: string]: {
        [index: string]: string;
    };
}
export declare const calculateDigests: (pkg: IPackage, alg?: string) => Promise<Digests>;
export declare const compareDigests: (digestsFile: Digests, calculatedDigests: Digests) => boolean;
/**
 * According to JWT Spec: (equal to timestamp)
 * A JSON numeric value representing the number of seconds from
 * 1970-01-01T00:00:00Z UTC until the specified UTC date/time,
 * ignoring leap seconds.  This is equivalent to the IEEE Std 1003.1,
 * 2013 Edition [POSIX.1] definition "Seconds Since the Epoch", in
 * which each day is accounted for by exactly 86400 seconds, other
 * than that non-integer values can be represented.
 */
export declare const getNumericDate: () => number;
export declare const createPayload: (pkg: IPackage, options?: {
    expiresIn?: number | undefined;
}) => Promise<{
    'version': number;
    'iss': string;
    'iat': number;
    'exp': number;
    'data': Digests;
}>;
export declare const formatAddressHex: (address: string) => string;
export declare const signaturePath: (address: string, pkg: IPackage) => Promise<string>;
export declare const getJwsFromSignatureEntry: (signatureEntry: IPackageEntry, decodeToken?: boolean) => Promise<jws.IFlattenedJwsSerialization>;
export declare const verifySignature: (signatureEntry: IPackageEntry, digests: Digests, listener?: StateListener) => Promise<IVerificationResult>;
export declare const getSignatureEntriesFromPackage: (pkg: IPackage, publicKeyInfo?: string | undefined) => Promise<IPackageEntry[]>;
export declare const getSignature: (pkg: IPackage, publicKeyInfo: string) => Promise<jws.IFlattenedJwsSerialization | undefined>;
export declare const containsSignature: (signers: ISignerInfo[], publicKeyInfo: string) => Promise<boolean>;
