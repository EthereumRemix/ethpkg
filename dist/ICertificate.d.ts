export declare const REGISTERED_SERVICES: {
    'GITHUB': string;
};
export declare const CERT_TYPE: {
    "PUBLIC_KEY": number;
    "CODE_SIGN": number;
};
export declare const IDENTITY_TYPE: {
    "ADDRESS": number;
    "EMAIL": number;
    "GITHUB": number;
    "GITLAB": number;
};
export interface IEthKeyShort {
    address: string;
    alg: string;
}
export interface ISubjectInfo {
    name: string;
    org?: string;
    email: string;
}
export interface ICsrOptions {
    csrType: number;
}
export interface IIdentityInfo {
    "entropy"?: string;
    "name": string;
    "username": string;
}
export interface IEthJwk {
    "kty": "EC";
    "key_ops": ["sign", "verify"];
    "crv": "P-256K";
    "x": string;
    "y": string;
    "key_scopes": {};
    "host": "";
    "endpoint": "";
    "alias": "";
    "eth": {
        address: string;
    };
}
export interface ICertProof {
}
export interface ICertificatePayload {
    version: number;
    jti: string;
    typ: number;
    iss: string;
    iat: number;
    exp?: number;
    nbf?: number;
    id_typ: number;
    sub: string;
    subject?: ISubjectInfo;
    service?: IIdentityInfo;
    key: IEthJwk | IEthKeyShort;
    proof?: ICertProof;
}
