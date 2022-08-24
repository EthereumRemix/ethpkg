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
const crypto_1 = __importDefault(require("crypto"));
const ethereumjs_util_1 = __importDefault(require("ethereumjs-util"));
const jws_1 = __importDefault(require("./jws"));
const base64url_1 = __importDefault(require("base64url"));
const pkg_1 = require("./pkgFormats/pkg");
const util_1 = require("./util");
const META_DIR = '_META_';
const SIGNATURE_PREFIX = `${META_DIR}/_sig`;
const shasum = (data, alg) => {
    return crypto_1.default
        .createHash(alg || 'sha256')
        .update(data)
        .digest('hex');
};
const calculateDigests = (entries, alg = 'sha512') => __awaiter(this, void 0, void 0, function* () {
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
        const decompressedData = yield file.readContent("nodebuffer");
        const checksum = shasum(decompressedData, alg);
        digests[alg][relativePath] = checksum;
    }
    return digests;
});
const compareDigests = (digestsFile, calculatedDigests) => {
    let checksumsFile = digestsFile['sha512'];
    let checksumsCalc = calculatedDigests['sha512'];
    let filesCalc = Object.keys(checksumsCalc);
    let filesCheck = Object.keys(checksumsFile);
    if (filesCalc.length !== filesCheck.length) {
        let difference = filesCalc
            .filter(x => !filesCheck.includes(x))
            .concat(filesCheck.filter(x => !filesCalc.includes(x)));
        throw new Error(`package contains more files than checksums: \n${difference.join('\n')} \n\n`);
    }
    for (const prop in checksumsCalc) {
        if (checksumsFile[prop] !== checksumsCalc[prop]) {
            throw new Error('integrity violation at file: ' + prop);
        }
    }
    return true;
};
const createPayload = (pkg) => __awaiter(this, void 0, void 0, function* () {
    const entries = yield pkg.getEntries();
    const digests = yield calculateDigests(entries);
    // TODO make sure JSON.stringify(digests) is deterministic: see
    // https://github.com/brianloveswords/node-jws/pull/83
    const payload = {
        "version": 1,
        "iss": "self",
        "exp": Date.now() + (24 * 60 * 60),
        "data": digests
    };
    return payload;
});
const formatAddressHex = (address) => {
    address = address.toLowerCase();
    if (!address.startsWith('0x')) {
        address = `0x${address}`;
    }
    return address;
};
const isNPM = (pkg) => __awaiter(this, void 0, void 0, function* () {
    const packageJson = yield pkg.getEntry('package/package.json');
    return packageJson != null;
});
const signaturePath = (address, pkg) => __awaiter(this, void 0, void 0, function* () {
    address = formatAddressHex(address);
    const shouldPrefix = yield isNPM(pkg);
    let prefixNpm = (shouldPrefix ? 'package/' : '');
    return `${prefixNpm + META_DIR}/_sig_${address}.json`;
});
const checksumsPath = (pkg) => __awaiter(this, void 0, void 0, function* () {
    const shouldPrefix = yield isNPM(pkg);
    let prefixNpm = (shouldPrefix ? 'package/' : '');
    return `${prefixNpm + META_DIR}/_checksums.json`;
});
const recoverAddress = (signatureObj) => __awaiter(this, void 0, void 0, function* () {
    const { signature } = signatureObj;
    const encodedProtectedHeader = signatureObj.protected;
    const encodedPayload = JSON.stringify(signatureObj.payload); // NOTE: not encoded due to b64:false flag
    const signingInput = Buffer.from(`${encodedProtectedHeader}.${encodedPayload}`);
    const signingInputHashed = ethereumjs_util_1.default.keccak256(signingInput);
    const decodedSignature = base64url_1.default.toBuffer(signature);
    const r = decodedSignature.slice(0, 32);
    const s = decodedSignature.slice(32, 64);
    const v = 27;
    const pub = ethereumjs_util_1.default.ecrecover(signingInputHashed, v, r, s);
    const address = formatAddressHex(ethereumjs_util_1.default.pubToAddress(pub).toString('hex'));
    // console.log('recovered: ', address)
    return address;
});
const verifyIntegrity = (payloadPkg, signatureObj) => __awaiter(this, void 0, void 0, function* () {
    const { payload } = signatureObj;
    const { data } = payload;
    let digestsMatch = false;
    try {
        // note we can only compare the digests but not "issue date" etc fields here
        digestsMatch = compareDigests(data, payloadPkg.data);
    }
    catch (error) {
        console.log('error: ', error);
        return false;
    }
    return digestsMatch === true;
});
const verifySignature = (signatureEntry, payloadPkg) => __awaiter(this, void 0, void 0, function* () {
    const signatureBuffer = yield signatureEntry.file.readContent('nodebuffer');
    const signatureObj = JSON.parse(signatureBuffer.toString());
    // check if files were changed after signing
    let isValid = false;
    try {
        isValid = yield verifyIntegrity(payloadPkg, signatureObj);
        if (!isValid) {
            console.log('integrity error: mismatch between package contents and signed checksums');
        }
    }
    catch (error) {
        console.log('error during integrity check', error);
    }
    // recover address / public key
    let recoveredAddress = 'invalid address';
    try {
        recoveredAddress = yield recoverAddress(signatureObj);
    }
    catch (error) {
        console.log('error during signature check', error);
    }
    // let header = JSON.parse(base64url.decode(signatureObj.protected))
    let { payload } = signatureObj;
    let { version } = payload;
    // console.log('recovered payload', payload)
    // TODO check signature date
    // TODO check signature certs
    // TODO check filename matches scheme with contained address
    // TODO check that recovered address matches header address
    const verificationResult = {
        signerAddress: recoveredAddress,
        isValid: (isValid === true),
        certificates: []
    };
    return verificationResult;
});
const getSignaturesFromPackage = (pkg, address) => __awaiter(this, void 0, void 0, function* () {
    if (address) {
        const _signaturePath = yield signaturePath(address, pkg);
        const sig = yield pkg.getEntry(_signaturePath);
        if (!sig) {
            return [];
        }
        return [sig];
    }
    const signatures = (yield pkg.getEntries()).filter((pkgEntry) => pkgEntry.relativePath.includes(SIGNATURE_PREFIX));
    return signatures;
});
const VERIFICATION_ERRORS = {
    UNSIGNED: 0,
    UNSIGNED_BY: 1,
    BAD_PACKAGE: 2,
    PACKAGE_DOWNLOAD: 3,
};
const VERIFICATION_ERROR_MESSAGES = {};
VERIFICATION_ERROR_MESSAGES[VERIFICATION_ERRORS.UNSIGNED] = `package is unsigned. (signatures missing or not parsable)`;
VERIFICATION_ERROR_MESSAGES[VERIFICATION_ERRORS.UNSIGNED_BY] = `package does not contain a signature for `;
VERIFICATION_ERROR_MESSAGES[VERIFICATION_ERRORS.BAD_PACKAGE] = `could not find or load package`;
VERIFICATION_ERROR_MESSAGES[VERIFICATION_ERRORS.PACKAGE_DOWNLOAD] = `could not download package`;
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
class pkgsign {
    static isSigned(pkg) {
        return __awaiter(this, void 0, void 0, function* () {
            const signatures = yield getSignaturesFromPackage(pkg);
            return signatures.length > 0;
        });
    }
    static sign(pkgSrc, privateKey, pkgPathOut) {
        return __awaiter(this, void 0, void 0, function* () {
            let pkg = null;
            try {
                pkg = yield this.loadPackage(pkgSrc);
            }
            catch (error) {
                console.log('could not find or load package');
                return;
            }
            if (!privateKey) {
                // TODO support external signers
                throw new Error('private key not provided or malformed');
            }
            /*
            1.  Create the content to be used as the JWS Payload.
            */
            const payload = yield createPayload(pkg);
            yield pkg.addEntry(yield checksumsPath(pkg), JSON.stringify(payload.data, null, 2));
            // sign payload according to RFC7515 Section 5.1
            const header = {
                alg: 'ES256K',
                b64: false,
                crit: ['b64']
            };
            const flattenedJwsSerialization = yield jws_1.default.sign(payload, privateKey, header);
            let address = '0x0000000000000000000000000000000000000000';
            if (Buffer.isBuffer(privateKey)) {
                // the signature file name is '_sig' || eth-address(publicKey) 
                address = ethereumjs_util_1.default.privateToAddress(privateKey).toString('hex');
            }
            else {
                // FIXME retrieve public key / address that was used to sign
                // should be part of the token metadata
            }
            if (!flattenedJwsSerialization) {
                console.log('jws signing failed');
                return;
            }
            const _signaturePath = yield signaturePath(address, pkg);
            yield pkg.addEntry(_signaturePath, JSON.stringify(flattenedJwsSerialization, null, 2));
            if (pkgPathOut) {
                yield pkg.writePackage(pkgPathOut);
            }
            return pkg;
        });
    }
    static recoverAddress(signerInput, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            return '';
        });
    }
    // TODO add ENS support
    static verify(pkgSrc, addressOrEnsName) {
        return __awaiter(this, void 0, void 0, function* () {
            let pkg = null;
            if (typeof pkgSrc !== 'string' && !Buffer.isBuffer(pkgSrc)) {
                pkg = pkgSrc;
            }
            else {
                try {
                    pkg = yield this.loadPackage(pkgSrc);
                }
                catch (error) {
                    return verificationError(VERIFICATION_ERRORS.BAD_PACKAGE);
                }
            }
            const signatures = yield getSignaturesFromPackage(pkg, addressOrEnsName);
            if (addressOrEnsName && signatures.length <= 0) { // signature not found
                return verificationError(VERIFICATION_ERRORS.UNSIGNED_BY, addressOrEnsName);
            }
            if (signatures.length === 0) {
                return verificationError(VERIFICATION_ERRORS.UNSIGNED);
            }
            const payloadPkg = yield createPayload(pkg);
            const promises = signatures.map(sig => verifySignature(sig, payloadPkg));
            const signatureInfos = yield Promise.all(promises);
            /*
            in order for a package to be verified, it
            - MUST have at least one signature
            - the signature MUST match the computed package payload
            - the payload MUST NOT be empty
            - all (valid) signatures MUST cover combined 100% of the package's contents TODO partial signatures currently not supported
        
            in order for a package to be trusted it
            - MUST have a valid certificate
            - with a proof or signed by a trusted CA
            - 100% of the package contents must be signed by at least one valid certificate
            */
            let isValid = true;
            signatureInfos.forEach(s => {
                isValid = isValid && s.isValid;
            });
            const verificationResult = {
                signers: signatureInfos.map(s => ({
                    address: s.signerAddress,
                    certificates: [],
                    coverage: 100
                })),
                isValid,
                isTrusted: false,
            };
            return verificationResult;
        });
    }
    static verifyNpm(pkgName, addressOrEnsName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let pkgPath = yield util_1.downloadNpmPackage(pkgName);
                if (!pkgPath) {
                    return verificationError(VERIFICATION_ERRORS.BAD_PACKAGE);
                }
                return this.verify(pkgPath, addressOrEnsName);
            }
            catch (error) {
                return verificationError(VERIFICATION_ERRORS.PACKAGE_DOWNLOAD);
            }
        });
    }
}
pkgsign.loadPackage = pkg_1.pkg.getPackage;
exports.default = pkgsign;
//# sourceMappingURL=pkgsign.js.map