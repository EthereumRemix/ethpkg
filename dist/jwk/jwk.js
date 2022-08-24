"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://tools.ietf.org/html/draft-jones-webauthn-secp256k1-00#section-2
exports.createJsonWebKey = (opts) => {
    if (!opts.address) {
        throw new Error('No address provided for JWK');
    }
    return {
        'kty': 'EC',
        'key_ops': [
            'sign',
            'verify'
        ],
        // EC 'extensions'
        'crv': 'P-256K',
        // note: most other jws apps will reject the jws without the public key info
        // 'x': undefined,
        // 'y': undefined,
        // most "account creation tools" / wallets only process the public key internally
        // for this reason it is very likely that we don't have access to the "raw" public key info
        // moreover, when we're using external signers there is no guaranteed access to private keys
        // which could be used to derive the public key. 
        // therefore it is best to only use the information we definitely have and optionally extend it
        'eth': {
            address: opts.address
        }
    };
};
//# sourceMappingURL=jwk.js.map