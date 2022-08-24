export interface IEthJWK {
    'kty': 'EC';
    'key_ops': ['sign', 'verify'];
    'crv': 'P-256K';
    'x'?: string;
    'y'?: string;
    'd'?: string;
    'key_scopes'?: {};
    'host'?: '';
    'endpoint'?: '';
    'alias'?: '';
    'eth': {
        address: string;
    };
}
export interface CreateKeyOptions {
    address: string;
}
export declare const createJsonWebKey: (opts: CreateKeyOptions) => IEthJWK;
