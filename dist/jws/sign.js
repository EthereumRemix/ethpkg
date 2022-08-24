"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = __importDefault(require("ethereumjs-util"));
const secp256k1 = require('secp256k1');
const base64url_1 = __importDefault(require("base64url"));
// TODO this signing scheme is quite dangerous as users can be tricked into signing transactions
// however hardware modules that implement secp256k1 are unlikely to implement ethereum personal message signing
// https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
const ecSign = (msg, privateKey) => __awaiter(this, void 0, void 0, function* () {
    const msgHash = ethereumjs_util_1.default.keccak256(msg);
    // const signature = ethUtil.ecsign(msgHash, privateKey)
    const signatureData = secp256k1.sign(msgHash, privateKey);
    const { signature } = signatureData;
    // const r = signature.slice(0, 32)
    // const s = signature.slice(32, 64)
    // signature.v = signatureData.recovery // eth specific: + 27
    // console.log('signature', signature)
    /**
    A JWS is signed with an ECDSA P-256 SHA-256 signature as follows:
    Generate a digital signature of the UTF-8 representation of the JWS Signing Input using ECDSA P-256 SHA-256 with the desired private key.
    The output will be the EC point (R, S), where R and S are unsigned integers.
    Turn R and S into byte arrays in big endian order. Each array will be 32 bytes long.
    Concatenate the two byte arrays in the order R and then S.
    Base64url encode the resulting 64 byte array.
    */
    // const signatureCompact = Buffer.concat([signature.r, signature.s])
    return signature;
});
const ethSign = (msg, privateKey) => __awaiter(this, void 0, void 0, function* () {
    const msgHash = ethereumjs_util_1.default.keccak256(msg);
    const signature = ethereumjs_util_1.default.ecsign(msgHash, privateKey);
    const signatureCompact = Buffer.concat([signature.r, signature.s]);
    return signatureCompact;
});
/*
1.  Create the content to be used as the JWS Payload. (happens outside of module)
*/
exports.default = (payload, signerOrPrivateKey, _header /*ignored atm: always defined as below*/) => __awaiter(this, void 0, void 0, function* () {
    /*
      [ 2. Compute the encoded payload value BASE64URL(JWS Payload). ]
      */
    // https://tools.ietf.org/html/rfc7797
    // step is skipped: const encodedPayload = base64url.encode(JSON.stringify(payload))
    const encodedPayload = JSON.stringify(payload);
    /*
    3.  Create the JSON object(s) containing the desired set of Header Parameters, which together comprise
    the JOSE Header (the JWS Protected Header and/or the JWS Unprotected Header).
    */
    const header = {
        // IMPORTANT: non-standard 'alg' value. see: 
        // https://tools.ietf.org/html/draft-jones-webauthn-secp256k1-00
        // https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms
        alg: 'ES256K',
        // skip payload encoding: https://tools.ietf.org/html/rfc7797
        b64: false,
        crit: ['b64']
        // FIXME specify key / cert
    };
    /*
    4. Compute the encoded header value BASE64URL(UTF8(JWS Protected Header)).
    If the JWS Protected Header is not present (which can only happen when using
    the JWS JSON Serialization and no "protected" member is present), let this value be the empty string.
    */
    const encodedHeader = base64url_1.default.encode(JSON.stringify(header));
    /*
    5. Compute the JWS Signature in the manner defined for the particular algorithm being used over the JWS Signing Input
    ASCII(BASE64URL(UTF8(JWS Protected Header)) || '.' || BASE64URL(JWS Payload)).
    The "alg" (algorithm) Header Parameter MUST be present in the JOSE Header, with the algorithm value
    accurately representing the algorithm used to construct the JWS Signature.
    */
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    let signature;
    if (Buffer.isBuffer(signerOrPrivateKey)) {
        signature = yield ecSign(signingInput, signerOrPrivateKey /* signerOrPrivateKey = privateKey */);
    }
    else {
        if (signerOrPrivateKey.type === 'signer') {
            let signer = signerOrPrivateKey;
            try {
                const signatureInfo = yield signer.sign.eth(signingInput);
                signature = signatureInfo.signature;
                const isValid = true; // TODO run checks on signature
                if (!signature || !isValid) {
                    throw new Error('external signer did not produce a valid signature');
                }
            }
            catch (error) {
                throw new Error('payload could not be signed: signer cancelled or threw error');
            }
        }
        else {
            throw new Error('signer argument is not a privateKey and not an instance of IExternalSigner');
        }
    }
    /*
    6. Compute the encoded signature value BASE64URL(JWS Signature).
    */
    const encodedSignature = base64url_1.default.encode(signature);
    /*
    SKIP: flattened syntax is used:
    [ 7. If the JWS JSON Serialization is being used, repeat this process (steps 3-6)
      for each digital signature or MAC operation being performed. ]
    */
    /*
    8. Create the desired serialized output.
    The JWS JSON Serialization is described in Section 7.2.
    */
    const flattenedJwsSerialization = {
        protected: encodedHeader,
        payload,
        signature: encodedSignature
    };
    return flattenedJwsSerialization;
});
//# sourceMappingURL=sign.js.map