/// <reference types="node" />
import { IPackage } from './pkgFormats/IPackage';
import IExternalSigner from './IExternalSigner';
import { IVerificationResult } from './IVerificationResult';
export default class pkgsign {
    static loadPackage: (pkgSrc: string | Buffer) => Promise<IPackage>;
    static isSigned(pkg: IPackage): Promise<boolean>;
    static sign(pkgSrc: string | Buffer, privateKey?: Buffer | IExternalSigner, pkgPathOut?: string): Promise<IPackage | undefined>;
    static recoverAddress(signerInput: string, signature: string): Promise<string>;
    static verify(pkgSrc: string | Buffer | IPackage, addressOrEnsName?: string): Promise<IVerificationResult>;
    static verifyNpm(pkgName: string, addressOrEnsName?: string): Promise<IVerificationResult>;
}
