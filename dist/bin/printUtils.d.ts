import { IRelease } from '../Repositories/IRepository';
import { IPackage, IPackageEntry } from '../PackageManager/IPackage';
import { IVerificationResult, ISignerInfo } from '../IVerificationResult';
export declare const printError: (error: string | Error) => void;
export declare const printWarning: (msg: string) => void;
export declare const printSuccess: (msg: string) => void;
export declare const print: (msg: string) => void;
/**
 * Takes a list of IRelease objects and prints them as a table
 * with property values as columns for each property key specified by attributes
 * @param releases
 * @param attributes comma separated list of property keys
 */
export declare const printFormattedReleaseList: (releases: IRelease[], attributes?: string) => void;
export declare const printFormattedRelease: (release?: IRelease | undefined) => void;
export declare const printFormattedSignerInfo: (signature: ISignerInfo) => void;
export declare const printFormattedVerificationResult: (result: IVerificationResult, warnUntrusted?: boolean) => void;
export declare const printFormattedPackageEntries: (pkg: IPackage) => Promise<IPackageEntry[]>;
export declare const printFormattedPackageInfo: (pkg?: IPackage | undefined, verificationInfo?: IVerificationResult | undefined) => Promise<void>;
export declare const PROCESSES: {
    FETCHING_RELEASE_LIST: {};
    FILTER_RELEASE_LIST: {};
};
export declare const createCLIPrinter: (processStates?: any[]) => {
    listener: (newState: string, args?: any) => void;
    print: (text: string, { isTask, bold }?: {
        isTask?: boolean | undefined;
        bold?: boolean | undefined;
    }) => void;
    fail: (error: string | Error) => void;
};
export declare const createResolvePrinter: () => void;
