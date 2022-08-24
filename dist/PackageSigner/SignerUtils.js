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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const jws = __importStar(require("../jws"));
const PackageUtils_1 = require("../utils/PackageUtils");
const ens_1 = require("../ENS/ens");
const IStateListener_1 = require("../IStateListener");
const META_DIR = '_META_';
const SIGNATURE_PREFIX = `${META_DIR}/_sig`;
const shasum = (data, alg) => {
    return crypto_1.default
        .createHash(alg || 'sha256')
        .update(data)
        .digest('hex');
};
exports.checksumsPath = (pkg) => __awaiter(void 0, void 0, void 0, function* () {
    const shouldPrefix = yield isNPM(pkg);
    let prefixNpm = (shouldPrefix ? 'package/' : '');
    return `${prefixNpm + META_DIR}/_checksums.json`;
});
exports.calculateDigests = (pkg, alg = 'sha512') => __awaiter(void 0, void 0, void 0, function* () {
    const entries = yield pkg.getEntries();
    const digests = {};
    digests[alg] = {};
    for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];
        const { relativePath, file } = entry;
        if (file.isDir) {
            continue;
        }
        // skip META DIR contents
        if (relativePath.includes(META_DIR)) {
            continue;
        }
        const decompressedData = yield file.readContent('nodebuffer');
        const checksum = shasum(decompressedData, alg);
        digests[alg][PackageUtils_1.normalizeRelativePath(relativePath)] = checksum;
    }
    return digests;
});
const normalizePaths = (checksums) => {
    let normalized = {};
    for (const filePath in checksums) {
        normalized[PackageUtils_1.normalizeRelativePath(filePath)] = checksums[filePath];
    }
    return normalized;
};
exports.compareDigests = (digestsFile, calculatedDigests) => {
    // calculate digests should already produce normalized paths 
    // but we should still sanitize input for compat reasons as this input might not be guaranteed
    let checksumsFile = normalizePaths(digestsFile['sha512']);
    let checksumsCalc = normalizePaths(calculatedDigests['sha512']);
    let filesCalc = Object.keys(checksumsCalc);
    let filesCheck = Object.keys(checksumsFile);
    if (filesCalc.length !== filesCheck.length) {
        let difference = filesCalc
            .filter(x => !filesCheck.includes(x))
            .concat(filesCheck.filter(x => !filesCalc.includes(x)));
        throw new Error(`package contains more files than checksums: \n${difference.join('\n')} \n\n`);
    }
    for (const filePath of filesCalc) {
        if (checksumsFile[filePath] !== checksumsCalc[filePath]) {
            throw new Error('integrity violation at file: ' + filePath);
        }
    }
    return true;
};
const daysToSeconds = (days) => {
    return days * 24 * 60 * 60;
};
/**
 * According to JWT Spec: (equal to timestamp)
 * A JSON numeric value representing the number of seconds from
 * 1970-01-01T00:00:00Z UTC until the specified UTC date/time,
 * ignoring leap seconds.  This is equivalent to the IEEE Std 1003.1,
 * 2013 Edition [POSIX.1] definition "Seconds Since the Epoch", in
 * which each day is accounted for by exactly 86400 seconds, other
 * than that non-integer values can be represented.
 */
exports.getNumericDate = () => {
    return Math.round((new Date()).getTime() / 1000);
};
const DEFAULT_EXPIRATION_DAYS = 180;
// TODO move to jwt
exports.createPayload = (pkg, options = {
    expiresIn: daysToSeconds(DEFAULT_EXPIRATION_DAYS)
}) => __awaiter(void 0, void 0, void 0, function* () {
    const digests = yield exports.calculateDigests(pkg);
    const payload = {
        'version': 1,
        // Issuer
        // The 'iss' (issuer) claim identifies the principal that issued the JWT
        'iss': 'self',
        // Issued At
        // The 'iat' (issued at) claim identifies the time at which the JWT was issued.
        'iat': exports.getNumericDate(),
        // Expiration Time
        // The 'exp' (expiration time) claim identifies the expiration time on
        // or after which the JWT MUST NOT be accepted for processing.
        'exp': exports.getNumericDate() + (options.expiresIn === undefined ? daysToSeconds(DEFAULT_EXPIRATION_DAYS) : options.expiresIn),
        // 'jti' : identifier that cna help prevent replay protection not used
        'data': digests
    };
    return payload;
});
exports.formatAddressHex = (address) => {
    address = address.toLowerCase();
    if (!address.startsWith('0x')) {
        address = `0x${address}`;
    }
    return address;
};
const isNPM = (pkg) => __awaiter(void 0, void 0, void 0, function* () {
    const packageJson = yield pkg.getEntry('package/package.json');
    return !!packageJson;
});
exports.signaturePath = (address, pkg) => __awaiter(void 0, void 0, void 0, function* () {
    address = exports.formatAddressHex(address);
    const shouldPrefix = yield isNPM(pkg);
    let prefixNpm = (shouldPrefix ? 'package/' : '');
    return `${prefixNpm + META_DIR}/_sig_${address}.json`;
});
exports.getJwsFromSignatureEntry = (signatureEntry, decodeToken = false) => __awaiter(void 0, void 0, void 0, function* () {
    const signatureBuffer = yield signatureEntry.file.readContent('nodebuffer');
    const signatureObj = JSON.parse(signatureBuffer.toString());
    if (decodeToken) {
        return jws.verify(signatureObj);
    }
    return signatureObj;
});
exports.verifySignature = (signatureEntry, digests, listener = () => { }) => __awaiter(void 0, void 0, void 0, function* () {
    const encodedToken = yield exports.getJwsFromSignatureEntry(signatureEntry);
    listener(IStateListener_1.PROCESS_STATES.VERIFY_JWS_STARTED, { signatureEntry });
    let decodedToken;
    try {
        // try to "verify"/validate the jws:
        // this will also verify the header's eth address against the signature's address
        decodedToken = yield jws.verify(encodedToken);
    }
    catch (error) {
        // TODO log with level
        // jws verification failed
        // console.log('verification error', error)
    }
    listener(IStateListener_1.PROCESS_STATES.VERIFY_JWS_FINISHED, { signatureEntry, decodedToken });
    if (!decodedToken) {
        return {
            isValid: false,
            isTrusted: false,
            signers: []
            // TODO error: provide error here
        };
    }
    // verify integrity: check if files covered by signature were changed after signing
    // by comparing digests in signature payload with newly computed digests
    // the signature is valid if the signed hashes match the actual computed file hashes
    listener(IStateListener_1.PROCESS_STATES.COMPARE_DIGESTS_STARTED, { signatureEntry, decodedToken });
    let isValid = false;
    try {
        const { payload } = decodedToken;
        // note we can only compare the digests but not "issue date" etc fields here
        isValid = exports.compareDigests(payload.data, digests);
    }
    catch (error) {
        // TODO log if verbosity level applies
        // console.log('error: ', error)
    }
    listener(IStateListener_1.PROCESS_STATES.COMPARE_DIGESTS_FINISHED, { signatureEntry, decodedToken });
    // recover address / public key
    // TODO after jws verify we can actually use the eth address from the jws header - it is already checked against the recovered one
    listener(IStateListener_1.PROCESS_STATES.RECOVER_SIGNATURE_ADDRESS_STARTED, { signatureEntry });
    let recoveredAddress;
    try {
        recoveredAddress = yield jws.recoverAddress(encodedToken);
    }
    catch (error) {
        console.log('Error during signature check', error);
        throw error;
    }
    listener(IStateListener_1.PROCESS_STATES.RECOVER_SIGNATURE_ADDRESS_FINISHED, { signatureEntry });
    isValid = isValid && !!recoveredAddress;
    let { payload } = decodedToken;
    let { version, iss, exp } = payload;
    // console.log('recovered payload', payload)
    // check if token is expired
    exp = exp || 0;
    // TODO use util to get the now timestamp
    const now = Math.floor(Date.now() / 1000);
    if (exp <= now) {
        // token is expired
        isValid = false;
    }
    // TODO provide reason why invalid
    // TODO check signature certs
    // TODO check filename matches scheme with contained address
    const signers = [];
    if (recoveredAddress) {
        signers.push({
            address: recoveredAddress,
            exp,
            certificates: []
        });
    }
    const verificationResult = {
        isValid,
        isTrusted: false,
        signers
    };
    return verificationResult;
});
exports.getSignatureEntriesFromPackage = (pkg, publicKeyInfo) => __awaiter(void 0, void 0, void 0, function* () {
    if (publicKeyInfo) {
        const _signaturePath = yield exports.signaturePath(publicKeyInfo, pkg);
        const sig = yield pkg.getEntry(_signaturePath);
        if (!sig) {
            return [];
        }
        return [sig];
    }
    const signatures = (yield pkg.getEntries()).filter((pkgEntry) => pkgEntry.relativePath.includes(SIGNATURE_PREFIX));
    return signatures;
});
exports.getSignature = (pkg, publicKeyInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const signatureEntries = yield exports.getSignatureEntriesFromPackage(pkg, publicKeyInfo);
    if (signatureEntries.length !== 1) {
        return undefined;
    }
    const jws = yield exports.getJwsFromSignatureEntry(signatureEntries[0]);
    return jws;
});
exports.containsSignature = (signers, publicKeyInfo) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof publicKeyInfo === 'string' && publicKeyInfo.endsWith('.eth')) {
        const publicKeyResolved = yield ens_1.resolveName(publicKeyInfo);
        if (publicKeyResolved === undefined) {
            // TODO log ens error
            return false;
        }
        publicKeyInfo = publicKeyResolved;
    }
    const result = signers.find(info => info.address.toLowerCase() === publicKeyInfo.toLowerCase());
    return result !== undefined;
});
//# sourceMappingURL=SignerUtils.js.map