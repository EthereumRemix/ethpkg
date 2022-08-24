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
const path_1 = __importDefault(require("path"));
const chai_1 = require("chai");
const SignerUtils = __importStar(require("./SignerUtils"));
const PackageService_1 = require("../PackageManager/PackageService");
const _1 = require(".");
const PackageUtils_1 = require("../utils/PackageUtils");
const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
const UNSIGNED_FOO_TAR_DECOMPRESSED = path_1.default.join(FIXTURES, 'foo.tar');
const UNSIGNED_FOO_TAR = path_1.default.join(FIXTURES, 'foo.tar.gz');
const SIGNED_FOO_TAR = path_1.default.join(FIXTURES, 'foo_signed.tar.gz');
const PRIVATE_KEY_1 = Buffer.from('62DEBF78D596673BCE224A85A90DA5AECF6E781D9AADCAEDD4F65586CFE670D2', 'hex');
const ETH_ADDRESS_1 = '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7';
// foo_signed.tar.gz contains two file and these are their digests
const SIGNED_FOO_DIGESTS = {
    sha512: {
        './foo.txt': 'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7',
        './bar.txt': 'd82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181'
    }
};
// contents of '_META_/_sig_0xf863ac227b0a0bca88cb2ff45d91632626ce32e7.json':
/*
  {
protected: 'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ',
payload: {
  version: 1,
  iss: 'self',
  exp: 1577456540302,
  data: { sha512: [Object] }
},
signature: 'pfVnV_A-OcIR7JL2PvIOkRGin4PisNSOtCUTpkDXtKU5lWFsGEInsEWZX3T87hnBfpxNXMay2Zae2gv5vGMM1Q'
}
  */
describe('SignerUtils', function () {
    describe('calculateDigests = async (pkg: IPackage, alg = "sha512") : Promise<Digests>', function () {
        it('calculates the sha5125 checksums / digests of all files within a compressed .tar.gz package', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(UNSIGNED_FOO_TAR);
            const digests = yield SignerUtils.calculateDigests(pkg);
            chai_1.assert.isDefined(digests);
            const { sha512 } = digests;
            chai_1.assert.equal(Object.keys(sha512).length, 2);
        }));
        it('calculates the sha5125 checksums / digests of all files within a decompressed .tar package', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(UNSIGNED_FOO_TAR_DECOMPRESSED);
            const digests = yield SignerUtils.calculateDigests(pkg);
            chai_1.assert.isDefined(digests);
            const { sha512 } = digests;
            chai_1.assert.equal(Object.keys(sha512).length, 2);
        }));
        it('produces the same digests for the same files inside different containers (.tar and .tar.gz)', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(UNSIGNED_FOO_TAR);
            const pkg2 = yield PackageService_1.toPackage(UNSIGNED_FOO_TAR_DECOMPRESSED);
            const digests = yield SignerUtils.calculateDigests(pkg);
            const digests2 = yield SignerUtils.calculateDigests(pkg2);
            const { sha512 } = digests;
            const { sha512: _sha512 } = digests2;
            chai_1.assert.deepEqual(sha512, _sha512);
        }));
        it('ignores files contained in the _META_ special dir of signed packages', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
            const digests = yield SignerUtils.calculateDigests(pkg);
            chai_1.assert.isDefined(digests);
            chai_1.assert.deepEqual(digests, SIGNED_FOO_DIGESTS);
        }));
        it('allows to specify an alternative hash function', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
            const digests = yield SignerUtils.calculateDigests(pkg, 'md5');
            chai_1.assert.isDefined(digests);
            const { md5 } = digests;
            chai_1.assert.equal(Object.keys(md5).length, 2);
        }));
    });
    describe('compareDigests = (digestsFile: Digests, calculatedDigests: Digests) : boolean', function () {
        it('compares two digest/checksum maps and returns true if they have ALL the same files/keys and checksums/values', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(UNSIGNED_FOO_TAR);
            const digests1 = yield SignerUtils.calculateDigests(pkg);
            const digests2 = yield SignerUtils.calculateDigests(pkg);
            const result = SignerUtils.compareDigests(digests1, digests2);
            chai_1.assert.isTrue(result);
        }));
        it('throws if one Digests map is empty or has fewer keys', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(UNSIGNED_FOO_TAR);
            const digests = yield SignerUtils.calculateDigests(pkg);
            const empty = { 'sha512': {} };
            chai_1.assert.throws(() => {
                SignerUtils.compareDigests(empty, digests);
            });
        }));
        it('is robust against different relative path formats', () => __awaiter(this, void 0, void 0, function* () {
            const d1 = {
                sha512: {
                    './bar.txt': 'd82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181'
                }
            };
            const d2 = {
                sha512: {
                    'bar.txt': 'd82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181'
                }
            };
            const result = yield SignerUtils.compareDigests(d1, d2);
            chai_1.assert.isTrue(result);
        }));
        it('throws an IntegrityViolationError if the files/keys don\'t match', () => __awaiter(this, void 0, void 0, function* () {
            const digests1 = {
                sha512: {
                    './foo.txt': 'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7',
                    './bar.txt': 'd82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181'
                }
            };
            const digests2 = {
                sha512: {
                    './foo.txt': 'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7',
                    './baz.txt': 'd82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181'
                }
            };
            chai_1.assert.throws(() => {
                SignerUtils.compareDigests(digests1, digests2);
            });
        }));
        it('throws an IntegrityViolationError if the checksums/values don\'t match', () => __awaiter(this, void 0, void 0, function* () {
            const digests1 = {
                sha512: {
                    './foo.txt': 'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7',
                    './bar.txt': 'd82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181'
                }
            };
            const digests2 = {
                sha512: {
                    './foo.txt': 'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7',
                    './bar.txt': 'a82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181'
                }
            };
            chai_1.assert.throws(() => {
                SignerUtils.compareDigests(digests1, digests2);
            });
        }));
        it.skip('returns true if only one set of matching digests is found for any supported hash function', () => __awaiter(this, void 0, void 0, function* () {
            const digests1 = {
                sha512: {},
                sha256: {
                    './foo.txt': '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
                    './bar.txt': 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9'
                }
            };
            const digests2 = {
                sha512: {
                    './foo.txt': 'aaaaaa',
                    './baz.txt': 'a82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181'
                },
                sha256: {
                    './foo.txt': '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
                    './bar.txt': 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9'
                }
            };
            try {
                const result = SignerUtils.compareDigests(digests1, digests2);
                chai_1.assert.isTrue(result);
            }
            catch (error) {
                chai_1.assert.fail('sha256 non-default is not handled properly');
            }
        }));
        it('can compare _checksums.json inside a signed package with a computed digest map', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
            const checksumsPath = yield SignerUtils.checksumsPath(pkg);
            const digestsFile = JSON.parse((yield pkg.getContent(checksumsPath)).toString());
            const digests = yield SignerUtils.calculateDigests(pkg);
            try {
                const result = SignerUtils.compareDigests(digestsFile, digests);
                chai_1.assert.isTrue(result);
            }
            catch (error) {
                chai_1.assert.fail('_checksums.json does not match digests');
            }
        }));
    });
    describe('createPayload = async (pkg : IPackage)', function () {
        it('calculates the unserialized jws payload', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
            const payload = yield SignerUtils.createPayload(pkg);
            chai_1.assert.isDefined(payload.data);
        }));
    });
    describe('getSignatureEntriesFromPackage = async (pkg : IPackage, address? : string) : Promise<Array<IPackageEntry>>', function () {
        // TODO test with more than one
        it('returns all signatures from a signed package', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
            const signatures = yield SignerUtils.getSignatureEntriesFromPackage(pkg);
            chai_1.assert.equal(signatures.length, 1);
        }));
        it('returns an empty array from an unsigned package', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(UNSIGNED_FOO_TAR);
            const signatures = yield SignerUtils.getSignatureEntriesFromPackage(pkg);
            chai_1.assert.equal(signatures.length, 0);
        }));
    });
    describe('verifySignature = async (signatureEntry : IPackageEntry, digests : Digests) : Promise<IVerificationResult>', function () {
        it('verifies a signature entry containing a jws when passed pkg digests and returns IVerificationResult', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
            const signatureEntry = yield pkg.getEntry('_META_/_sig_0xf863ac227b0a0bca88cb2ff45d91632626ce32e7.json');
            chai_1.assert.isDefined(signatureEntry);
            const result = yield SignerUtils.verifySignature(signatureEntry, SIGNED_FOO_DIGESTS);
            chai_1.assert.isTrue(result.isValid);
        }));
        describe('performs integrity checks:', function () {
            it('returns isValid=false if the signature applies to different file digests than the actual ones from package', () => __awaiter(this, void 0, void 0, function* () {
                const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
                const signatureEntry = yield pkg.getEntry('_META_/_sig_0xf863ac227b0a0bca88cb2ff45d91632626ce32e7.json');
                // the passed-in digests are considered "ground truth" so even if the signature is actually valid
                // passing in different checksums should result in invalid signature
                const SIGNED_FOO_DIGESTS_UPDATED = {
                    sha512: {
                        './foo.txt': 'bbbbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7',
                        './bar.txt': 'd82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181'
                    }
                };
                const result = yield SignerUtils.verifySignature(signatureEntry, SIGNED_FOO_DIGESTS_UPDATED);
                chai_1.assert.isFalse(result.isValid);
            }));
            it('returns isValid=false if the signature applies to fewer files than the package contains at the moment (no partial signatures)', () => __awaiter(this, void 0, void 0, function* () {
                const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
                const signatureEntry = yield pkg.getEntry('_META_/_sig_0xf863ac227b0a0bca88cb2ff45d91632626ce32e7.json');
                const SIGNED_FOO_DIGESTS_UPDATED = {
                    sha512: {
                        './foo.txt': 'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7',
                        './bar.txt': 'd82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181',
                        './imaginary/new/file.txt': 'd82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181'
                    }
                };
                const result = yield SignerUtils.verifySignature(signatureEntry, SIGNED_FOO_DIGESTS_UPDATED);
                chai_1.assert.isFalse(result.isValid);
            }));
            it('adding new files invalidates all included signatures', () => __awaiter(this, void 0, void 0, function* () {
                const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
                const signatureEntry = yield pkg.getEntry('_META_/_sig_0xf863ac227b0a0bca88cb2ff45d91632626ce32e7.json');
                // package modification: adding new files invalidates included signature
                const newEntry = yield PackageUtils_1.toIFile('new/entry.txt', 'hello world');
                yield pkg.addEntry('new/entry.txt', newEntry);
                const digests = yield SignerUtils.calculateDigests(pkg);
                const result = yield SignerUtils.verifySignature(signatureEntry, digests);
                chai_1.assert.isFalse(result.isValid);
            }));
            it('modifying the content of files inside the package invalidates all included signatures', () => __awaiter(this, void 0, void 0, function* () {
                const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
                const signatureEntry = yield pkg.getEntry('_META_/_sig_0xf863ac227b0a0bca88cb2ff45d91632626ce32e7.json');
                // package modification: overwriting files invalidates included signature
                let c = yield pkg.getContent('./foo.txt');
                chai_1.assert.equal(c.toString(), 'foo');
                const newEntry = yield PackageUtils_1.toIFile('./foo.txt', 'hello world');
                yield pkg.addEntry('./foo.txt', newEntry);
                c = yield pkg.getContent('./foo.txt');
                chai_1.assert.equal(c.toString(), 'hello world');
                const digests = yield SignerUtils.calculateDigests(pkg);
                const result = yield SignerUtils.verifySignature(signatureEntry, digests);
                chai_1.assert.isFalse(result.isValid);
            }));
            it.skip('removing files from the package invalidates all included signatures', () => __awaiter(this, void 0, void 0, function* () {
                // TODO needs implementation in IPackage
            }));
            it('re-signing after files were added to pkg results in a valid signature again', () => __awaiter(this, void 0, void 0, function* () {
                const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
                const signatureEntry = yield pkg.getEntry('_META_/_sig_0xf863ac227b0a0bca88cb2ff45d91632626ce32e7.json');
                // package modification: adding new files invalidates included signature
                const newEntry = yield PackageUtils_1.toIFile('new/entry.txt', 'hello world');
                yield pkg.addEntry('new/entry.txt', newEntry);
                const digests = yield SignerUtils.calculateDigests(pkg);
                const result = yield SignerUtils.verifySignature(signatureEntry, digests);
                chai_1.assert.isFalse(result.isValid);
                yield _1.sign(pkg, PRIVATE_KEY_1);
                const result2 = yield SignerUtils.verifySignature(signatureEntry, digests);
                chai_1.assert.isTrue(result2.isValid);
            }));
        });
        describe('the signers array contains a single ISignerInfo object', () => __awaiter(this, void 0, void 0, function* () {
            it('which includes the recovered ethereum address of the signer', () => __awaiter(this, void 0, void 0, function* () {
                const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
                const signatureEntry = yield pkg.getEntry('_META_/_sig_0xf863ac227b0a0bca88cb2ff45d91632626ce32e7.json');
                const result = yield SignerUtils.verifySignature(signatureEntry, SIGNED_FOO_DIGESTS);
                const { signers } = result;
                chai_1.assert.equal(signers.length, 1);
                const signer = signers.pop();
                if (!signer) {
                    return chai_1.assert.fail();
                }
                chai_1.assert.equal(signer.address, ETH_ADDRESS_1.toLowerCase());
            }));
            it('the recovered address should match the address part of the file name', () => __awaiter(this, void 0, void 0, function* () {
                const FILEPATH = '_META_/_sig_0xf863ac227b0a0bca88cb2ff45d91632626ce32e7.json';
                const pkg = yield PackageService_1.toPackage(SIGNED_FOO_TAR);
                const signatureEntry = yield pkg.getEntry(FILEPATH);
                const result = yield SignerUtils.verifySignature(signatureEntry, SIGNED_FOO_DIGESTS);
                const { signers } = result;
                chai_1.assert.equal(signers.length, 1);
                const signer = signers.pop();
                if (!signer) {
                    return chai_1.assert.fail();
                }
                chai_1.assert.isTrue(FILEPATH.includes(signer.address));
            }));
        }));
        it.skip('checks the exp field of the token\'s payload', () => {
        });
    });
    describe('containsSignature = async (signers: Array<ISignerInfo>, publicKeyInfo: PublicKeyInfo) : Promise<boolean>', function () {
        it('returns true if publicKeyInfo is present in the list of signers', () => __awaiter(this, void 0, void 0, function* () {
            const info = {
                address: '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7',
                certificates: [],
            };
            const publicKeyInfo = '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7';
            const result = yield SignerUtils.containsSignature([info], publicKeyInfo);
            chai_1.assert.isTrue(result);
        }));
        it('returns false if signers is an empty array', () => __awaiter(this, void 0, void 0, function* () {
            const publicKeyInfo = '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7';
            const result = yield SignerUtils.containsSignature([], publicKeyInfo);
            chai_1.assert.isFalse(result);
        }));
        it('returns false if signers array does not contain publicKeyInfo', () => __awaiter(this, void 0, void 0, function* () {
            const info = {
                address: '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7',
                certificates: [],
            };
            const publicKeyInfo = '0xFFFFFFF27B0a0BCA88Cb2Ff45d91632626CE32e7';
            const result = yield SignerUtils.containsSignature([info], publicKeyInfo);
            chai_1.assert.isFalse(result);
        }));
        it('returns false if publicKeyInfo is an invalid address', () => __awaiter(this, void 0, void 0, function* () {
            const info = {
                address: '0xF003aC227B0a0BCA88Cb2Ff45d91632626CE32e7',
                certificates: [],
            };
            const publicKeyInfo = '0xFOO3aC227B0a0BCA88Cb2Ff45d91632626CE32e7';
            const result = yield SignerUtils.containsSignature([info], publicKeyInfo);
            chai_1.assert.isFalse(result);
        }));
        it('handles ENS names', () => __awaiter(this, void 0, void 0, function* () {
            const info = {
                address: '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7',
                certificates: [],
            };
            const publicKeyInfo = 'foo.test.eth';
            const result = yield SignerUtils.containsSignature([info], publicKeyInfo);
            chai_1.assert.isTrue(result);
        }));
        it.skip('handles public key certificates', () => __awaiter(this, void 0, void 0, function* () {
            const info = {
                address: '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7',
                certificates: [],
            };
            // TODO needs implementation
            const publicKeyInfo /*: ICertificate */ = '';
            const result = yield SignerUtils.containsSignature([info], publicKeyInfo);
            chai_1.assert.isTrue(result);
        }));
        it('handles ethereum addresses in checksum format (EIP-55)', () => __awaiter(this, void 0, void 0, function* () {
            const info = {
                address: '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7',
                certificates: [],
            };
            const publicKeyInfo = '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7';
            const result = yield SignerUtils.containsSignature([info], publicKeyInfo);
            chai_1.assert.isTrue(result);
        }));
        it('handles ethereum addresses without checksum format 1', () => __awaiter(this, void 0, void 0, function* () {
            const info = {
                address: '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7',
                certificates: [],
            };
            const publicKeyInfo = info.address.toLowerCase();
            const result = yield SignerUtils.containsSignature([info], publicKeyInfo);
            chai_1.assert.isTrue(result);
        }));
        it('handles ethereum addresses without checksum format 2', () => __awaiter(this, void 0, void 0, function* () {
            const signers = [
                {
                    address: '0xf863ac227b0a0bca88cb2ff45d91632626ce32e7',
                    certificates: []
                }
            ];
            const publicKeyInfo = ETH_ADDRESS_1;
            const result = yield SignerUtils.containsSignature(signers, publicKeyInfo);
            chai_1.assert.isTrue(result);
        }));
    });
});
//# sourceMappingURL=SignerUtils.spec.js.map