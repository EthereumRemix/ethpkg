"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethUtil = __importStar(require("ethereumjs-util"));
const base64url_1 = __importDefault(require("base64url"));
const PrivateKeySigner_1 = __importDefault(require("../Signers/PrivateKeySigner"));
const jwk_1 = require("../jwk");
// we sort the payload fields to achieve determinism FIX#1
// https://stackoverflow.com/questions/5467129/sort-javascript-object-by-key/31102605#31102605
// https://github.com/brianloveswords/node-jws/pull/83
exports.safeStringify = (payload) => {
    const ordered = {};
    Object.keys(payload).sort().forEach(function (key) {
        ordered[key] = payload[key];
    });
    return JSON.stringify(ordered);
};
exports.ecRecover = (signatureHexStr, msg, scheme = exports.ALGORITHMS.EC_SIGN) => __awaiter(void 0, void 0, void 0, function* () {
    // if compact [r,s] form detected 
    if (signatureHexStr.length === (64 * 2)) {
        signatureHexStr += '1B'; // append v=27
    }
    const msgHash = scheme === exports.ALGORITHMS.EC_SIGN ? ethUtil.keccak256(msg) : ethUtil.hashPersonalMessage(Buffer.from(msg));
    // fromRpcSig expects a 0x prefixed hex string
    signatureHexStr = ethUtil.addHexPrefix(signatureHexStr);
    const sigParams = ethUtil.fromRpcSig(signatureHexStr);
    const recoveredPublic = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s);
    const recovered = ethUtil.pubToAddress(recoveredPublic);
    const address = `0x${recovered.toString('hex')}`;
    return address;
});
exports.ALGORITHMS = {
    'EC_SIGN': 'ES256K',
    'ETH_SIGN': 'ETH',
};
/**
 * Create the JSON object(s) containing the desired set of Header Parameters,
 * which together comprise the JOSE Header (the JWS Protected Header and/or the JWS Unprotected Header).
 */
exports.createHeader = (options) => {
    if (!Object.values(exports.ALGORITHMS).includes(options.algorithm)) {
        throw new Error('Unsupported signing algorithm: ' + options.algorithm);
    }
    let { address } = options;
    if (!address.startsWith('0x')) {
        address = `0x${address}`;
    }
    // For a JWT object, the members of the JSON object represented by the
    // JOSE Header describe the cryptographic operations applied to the JWT
    // and optionally, additional properties of the JWT.  Depending upon
    // whether the JWT is a JWS or JWE, the corresponding rules for the JOSE
    // Header values apply.
    // see https://tools.ietf.org/html/rfc7515#section-4.1
    const header = {
        // If present, it is RECOMMENDED that its value be "JWT"
        // to indicate that this object is a JWT.
        // TODO hardcoded to JWT since we are only using it for JWT. this logic should be moved to jwt module.
        'typ': 'JWT',
        // The "alg" (algorithm) Header Parameter identifies the cryptographic
        // algorithm used to secure the JWS.  The JWS Signature value is not
        // valid if the "alg" value does not represent a supported algorithm or
        // if there is not a key for use with that algorithm associated with the
        // party that digitally signed or MACed the content. 
        //  "alg" values
        //  should either be registered in the IANA "JSON Web Signature and
        //  Encryption Algorithms" registry established by [JWA] or be a value
        //  that contains a Collision-Resistant Name.  The "alg" value is a case-
        //  sensitive ASCII string containing a StringOrURI value.  This Header
        //  Parameter MUST be present and MUST be understood and processed by
        //  implementations.
        // IMPORTANT: non-standard 'alg' value. see: 
        // https://tools.ietf.org/html/draft-jones-webauthn-secp256k1-00
        // https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms
        alg: options.algorithm,
        // skip payload encoding: https://tools.ietf.org/html/rfc7797
        b64: false,
        crit: ['b64'],
        // this info is quite important:
        // https://tools.ietf.org/html/draft-jones-webauthn-secp256k1-00#section-2
        // The "jwk" (JSON Web Key) Header Parameter is the public key that
        // corresponds to the key used to digitally sign the JWS.  This key is
        // represented as a JSON Web Key
        jwk: jwk_1.createJsonWebKey({ address })
        // TODO IMPORTANT: allow the use of certificates here
    };
    return header;
};
// TODO needs implementation
const validateHeader = () => { };
exports.sign = (payload, signerOrPrivateKey, header) => __awaiter(void 0, void 0, void 0, function* () {
    // turn pk buffer into ISigner if necessary
    const signer = Buffer.isBuffer(signerOrPrivateKey) ? new PrivateKeySigner_1.default(signerOrPrivateKey) : signerOrPrivateKey;
    /*
    Compute the encoded header value BASE64URL(UTF8(JWS Protected Header)).
    If the JWS Protected Header is not present (which can only happens when using
    the JWS JSON Serialization and no "protected" member is present), let this value be the empty string.
    */
    header = header || exports.createHeader({
        algorithm: exports.ALGORITHMS.EC_SIGN,
        address: yield signer.getAddress()
    });
    const encodedHeader = base64url_1.default.encode(exports.safeStringify(header));
    // Compute the encoded payload value BASE64URL(JWS Payload)
    // https://tools.ietf.org/html/rfc7797
    // step is skipped: const encodedPayload = base64url.encode(JSON.stringify(payload))
    const encodedPayload = exports.safeStringify(payload);
    /*
    Compute the JWS Signature in the manner defined for the particular algorithm being used over the JWS Signing Input
    ASCII(BASE64URL(UTF8(JWS Protected Header)) || '.' || BASE64URL(JWS Payload)).
    The "alg" (algorithm) Header Parameter MUST be present in the JOSE Header, with the algorithm value
    accurately representing the algorithm used to construct the JWS Signature.
    */
    const signingInput = Buffer.from(`${encodedHeader}.${encodedPayload}`);
    let signature;
    /**
     * https://tools.ietf.org/id/draft-jones-json-web-signature-02.html#DefiningECDSA:
      A JWS is signed with an ECDSA P-256 SHA-256 signature as follows:
      Generate a digital signature of the UTF-8 representation of the JWS Signing Input using ECDSA P-256 SHA-256 with the desired private key.
      The output will be the EC point (R, S), where R and S are unsigned integers.
      Turn R and S into byte arrays in big endian order. Each array will be 32 bytes long.
      Concatenate the two byte arrays in the order R and then S.
      Base64url encode the resulting 64 byte array.
    */
    if (header.alg === exports.ALGORITHMS.EC_SIGN) {
        if (!signer.ecSign) {
            throw new Error(`Signer "${signer.name}" does not implement EC signing`);
        }
        signature = yield signer.ecSign(signingInput);
    }
    else if (header.alg === exports.ALGORITHMS.ETH_SIGN) {
        if (!signer.ethSign) {
            throw new Error(`Signer "${signer.name}" does not implement personal message signing`);
        }
        signature = yield signer.ethSign(signingInput);
    }
    else {
        throw new Error('Unsupported algorithm');
    }
    // length 64 is according to ietf spec draft
    // length 65 is bitcoin style
    const isValid = !!signature && (signature.length === 64 || signature.length === 65); // TODO run checks on signature
    if (!signature) {
        throw new Error(`Payload could not be signed: signer "${signer.name}" cancelled or threw error`);
    }
    if (!isValid) {
        throw new Error(`Signer "${signer.name}" produced an invalid signature`);
    }
    let address = yield signer.getAddress();
    address = address.startsWith('0x') ? address : `0x${address}`;
    const recoveredAddress = yield exports.ecRecover(signature.toString('hex'), signingInput.toString(), header.alg);
    if (address.toLowerCase() !== recoveredAddress.toLowerCase()) {
        throw new Error(`Failed to sign: recovered address does not match signer's address: ${address} vs ${recoveredAddress}`);
    }
    /*
    Compute the encoded signature value BASE64URL(JWS Signature).
    */
    const encodedSignature = base64url_1.default.encode(signature);
    /*
    Create the desired serialized output.
    The JWS JSON Serialization is described in Section 7.2.
    */
    const flattenedJwsSerialization = {
        protected: encodedHeader,
        payload,
        signature: encodedSignature
    };
    return flattenedJwsSerialization;
});
// don't needs to be exported because verify returns the decoded token
exports.decode = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const { protected: encodedProtectedHeader, payload, signature } = token;
    const decodedHeader = base64url_1.default.toBuffer(encodedProtectedHeader || '').toString();
    const decodedSignature = base64url_1.default.toBuffer(signature).toString('hex');
    return {
        header: JSON.parse(decodedHeader),
        protected: decodedHeader,
        payload,
        signature: decodedSignature
    };
});
exports.recoverAddress = (encodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const { protected: encodedProtectedHeader } = encodedToken;
    const decoded = yield exports.decode(encodedToken);
    const { /*protected,*/ payload, signature } = decoded;
    // TODO consider moving to helper
    const encodedPayload = exports.safeStringify(payload); // NOTE: not encoded due to b64:false flag
    const signingInput = `${encodedProtectedHeader}.${encodedPayload}`;
    // TODO handle eth and ec
    const address = yield exports.ecRecover(signature, signingInput);
    return address;
});
exports.verify = (token, secretOrPublicKey, options) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = yield exports.decode(token);
    const address = yield exports.recoverAddress(token);
    const { header } = decoded;
    // the public key of the signature should match the one defined 
    // in the JOSE header
    // The "jwk" (JSON Web Key) Header Parameter is the public key that
    // corresponds to the key used to digitally sign the JWS. 
    const { jwk } = header;
    if (!jwk) {
        throw new Error('no key information present in jws header');
    }
    if (!jwk.eth || !jwk.eth.address) {
        throw new Error('no eth address information present in jws header');
    }
    if (address.toLowerCase() === jwk.eth.address.toLowerCase()) {
        return decoded;
    }
    if (Buffer.isBuffer(secretOrPublicKey)) {
        secretOrPublicKey = secretOrPublicKey.toString();
    }
    // all tokens can be verified based on the jwk header without an extra public key
    // which creates a security issue if not handled correctly
    // see: https://mailarchive.ietf.org/arch/msg/jose/gQU_C_QURVuwmy-Q2qyVwPLQlcg
    if (!secretOrPublicKey) {
        return decoded;
    }
    if (address.toLowerCase() === secretOrPublicKey.toLowerCase()) {
        return decoded;
    }
    throw new Error('jws verification failed - invalid token');
});
//# sourceMappingURL=jws.js.map