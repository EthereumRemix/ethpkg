/// <reference types="node" />
import { ISubjectInfo, ICsrOptions } from "./ICertificate";
import { IFlattenedJwsSerialization } from './IJWS';
declare type ICertificateSigningRequest = IFlattenedJwsSerialization;
export default class cert {
    static csr(SubjectIdentityInfo: ISubjectInfo, privateKey: Buffer, options: ICsrOptions): Promise<IFlattenedJwsSerialization | string | object | null>;
    static issue(validatedCsr: ICertificateSigningRequest, privateKey: Buffer, optionsHeader: any, ca?: {
        iss: string;
    }): Promise<IFlattenedJwsSerialization>;
}
export {};
