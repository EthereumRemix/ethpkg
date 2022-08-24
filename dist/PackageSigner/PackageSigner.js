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
const jws = __importStar(require("../jws"));
const SignerUtils = __importStar(require("./SignerUtils"));
const PackageService_1 = require("../PackageManager/PackageService");
const jws_1 = require("../jws");
const PackageUtils_1 = require("../utils/PackageUtils");
const IStateListener_1 = require("../IStateListener");
const ens_1 = require("../ENS/ens");
const util_1 = require("../util");
const PrivateKeySigner_1 = __importDefault(require("../Signers/PrivateKeySigner"));
const VERIFICATION_ERRORS = {
    UNSIGNED: 0,
    UNSIGNED_BY: 1,
    BAD_PACKAGE: 2,
    PACKAGE_DOWNLOAD: 3,
};
const VERIFICATION_ERROR_MESSAGES = {};
VERIFICATION_ERROR_MESSAGES[VERIFICATION_ERRORS.UNSIGNED] = `Package is unsigned (signatures missing or not parsable)`;
VERIFICATION_ERROR_MESSAGES[VERIFICATION_ERRORS.UNSIGNED_BY] = `Package does not contain a signature for:`;
VERIFICATION_ERROR_MESSAGES[VERIFICATION_ERRORS.BAD_PACKAGE] = `Could not find or load package`;
VERIFICATION_ERROR_MESSAGES[VERIFICATION_ERRORS.PACKAGE_DOWNLOAD] = `Could not download package`;
const verificationError = (errorCode, val = '') => {
    return {
        signers: [],
        isValid: false,
        isTrusted: false,
        error: {
            code: errorCode,
            message: `${VERIFICATION_ERROR_MESSAGES[errorCode]} ${val}`
        }
    };
};
const writeChecksumsJson = (pkg, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const checksumsPath = yield SignerUtils.checksumsPath(pkg);
    const checksumsFile = PackageUtils_1.toIFile(checksumsPath, JSON.stringify(payload.data, null, 2));
    yield pkg.addEntry(checksumsPath, checksumsFile);
});
const writeSignatureEntry = (pkg, jws, address) => __awaiter(void 0, void 0, void 0, function* () {
    // the signature file name is '_sig' || eth-address(publicKey) 
    const signaturePath = yield SignerUtils.signaturePath(address, pkg);
    const flattenedJsonSerializationFile = PackageUtils_1.toIFile(signaturePath, JSON.stringify(jws, null, 2));
    yield pkg.addEntry(signaturePath, flattenedJsonSerializationFile);
});
exports.isSigned = (pkgSpec) => __awaiter(void 0, void 0, void 0, function* () {
    const pkg = yield PackageService_1.toPackage(pkgSpec);
    const signatures = yield SignerUtils.getSignatureEntriesFromPackage(pkg);
    return signatures.length > 0;
});
exports.isValid = (pkgSpec) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const verificationResult = yield exports.verify(pkgSpec);
        return verificationResult.isValid;
    }
    catch (error) {
        // TODO log with loglevel
        return false;
    }
});
const isTrusted = (pkgSpec, publicKeyInfo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const verificationResult = yield exports.verify(pkgSpec);
        return verificationResult.isTrusted;
    }
    catch (error) {
        // TODO log with loglevel
        return false;
    }
});
exports.sign = (pkgSpec, privateKey, { expiresIn = undefined, listener = () => { }, algorithm = util_1.is.browser() ? jws_1.ALGORITHMS.ETH_SIGN : jws_1.ALGORITHMS.EC_SIGN } = {}) => __awaiter(void 0, void 0, void 0, function* () {
    let pkg;
    try {
        pkg = yield PackageService_1.toPackage(pkgSpec);
    }
    catch (error) {
        throw new Error(VERIFICATION_ERRORS.BAD_PACKAGE);
    }
    let signer;
    if (Buffer.isBuffer(privateKey)) {
        signer = new PrivateKeySigner_1.default(privateKey);
    }
    else if (typeof privateKey === 'string') {
        new PrivateKeySigner_1.default(Buffer.from(privateKey, 'hex'));
    }
    if (!signer) {
        // TODO support external signers
        throw new Error('private key / ISigner not provided or malformed');
    }
    const address = yield signer.getAddress();
    // create the content to be used as the JWS Payload.
    listener(IStateListener_1.PROCESS_STATES.CREATE_PAYLOAD_STARTED);
    const payload = yield SignerUtils.createPayload(pkg, {
        expiresIn
    });
    listener(IStateListener_1.PROCESS_STATES.CREATE_PAYLOAD_FINISHED, { payload });
    const header = jws_1.createHeader({
        algorithm,
        address
    });
    // sign payload according to RFC7515 Section 5.1
    listener(IStateListener_1.PROCESS_STATES.SIGNING_PAYLOAD_STARTED);
    const flattenedJwsSerialization = yield jws.sign(payload, signer, header);
    if (!flattenedJwsSerialization) {
        throw new Error('jws signing failed');
    }
    listener(IStateListener_1.PROCESS_STATES.SIGNING_PAYLOAD_FINISHED);
    // add entries
    listener(IStateListener_1.PROCESS_STATES.ADDING_SIGNATURE_METADATA_STARTED);
    yield writeChecksumsJson(pkg, payload);
    yield writeSignatureEntry(pkg, flattenedJwsSerialization, address);
    listener(IStateListener_1.PROCESS_STATES.ADDING_SIGNATURE_METADATA_FINISHED);
    return pkg;
});
/**
 *
 * @param pkgSpec
 * @param publicKeyInfo
 */
exports.verify = (pkgSpec, { addressOrEnsName = undefined, listener = () => { } } = {}) => __awaiter(void 0, void 0, void 0, function* () {
    if (addressOrEnsName) {
        if (addressOrEnsName.endsWith('.eth')) {
            listener(IStateListener_1.PROCESS_STATES.RESOLVE_ENS_STARTED, { name: addressOrEnsName });
            const address = yield ens_1.resolveName(addressOrEnsName);
            if (!address) {
                throw new Error(`ENS name "${addressOrEnsName}" could not be resolved!`);
            }
            listener(IStateListener_1.PROCESS_STATES.RESOLVE_ENS_FINISHED, { name: addressOrEnsName, address });
            addressOrEnsName = address;
        }
    }
    let pkg;
    try {
        pkg = yield PackageService_1.toPackage(pkgSpec);
        if (!pkg)
            throw new Error('Package could not be fetched for specifier: ' + pkgSpec);
    }
    catch (error) {
        return verificationError(VERIFICATION_ERRORS.BAD_PACKAGE);
    }
    const signatures = yield SignerUtils.getSignatureEntriesFromPackage(pkg /*TODO? needs support for ens etc, publicKeyInfo*/);
    // TODO the error that the package is unsigned if publicKey not found is misleading
    if (signatures.length === 0) {
        return verificationError(VERIFICATION_ERRORS.UNSIGNED);
    }
    // TODO handle publicKeyInfo is cert
    // TODO handle publicKeyInfo is ens
    listener(IStateListener_1.PROCESS_STATES.CREATE_PAYLOAD_STARTED);
    const payload = yield SignerUtils.createPayload(pkg);
    const { data: digests } = payload;
    listener(IStateListener_1.PROCESS_STATES.CREATE_PAYLOAD_FINISHED, { payload });
    // listener(PROCESS_STATES.VERIFYING_SIGNATURES_STARTED)
    const promises = signatures.map(sig => SignerUtils.verifySignature(sig, digests, listener));
    const verificationResults = yield Promise.all(promises);
    // listener(PROCESS_STATES.VERIFYING_SIGNATURES_FINISHED)
    // TODO this check can be performed before we calculate checksums etc - fail fast
    let signatureFound = false;
    if (addressOrEnsName) {
        for (const verificationResult of verificationResults) {
            const { signers } = verificationResult;
            if (yield SignerUtils.containsSignature(signers, addressOrEnsName)) {
                signatureFound = true;
            }
        }
        if (!signatureFound) {
            return verificationError(VERIFICATION_ERRORS.UNSIGNED_BY, addressOrEnsName);
        }
    }
    /*
    in order for a package to be verified, it
    - MUST have at least one signature
    - the signature MUST match the computed package digests
    - the digests MUST NOT be empty
    - all (valid) signatures MUST cover combined 100% of the package's contents TODO partial signatures currently not supported
  
    in order for a package to be trusted it
    - MUST have a valid certificate OR ENS name
    - with a proof of identity or signed by a trusted CA
    - 100% of the package contents must be signed by at least one valid certificate
    */
    const signers = verificationResults.map(v => v.signers.pop());
    let isValid = verificationResults.length > 0;
    for (const verificationResult of verificationResults) {
        isValid = isValid && verificationResult.isValid;
    }
    const isTrusted = isValid && signatureFound; // TODO implement cert logic
    const verificationResult = {
        signers,
        isValid,
        isTrusted,
    };
    return verificationResult;
});
//# sourceMappingURL=PackageSigner.js.map