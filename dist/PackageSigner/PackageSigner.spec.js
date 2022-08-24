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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chai_1 = require("chai");
const PackageSigner = __importStar(require("."));
const SignerUtils = __importStar(require("./SignerUtils"));
const TarPackage_1 = __importDefault(require("../PackageManager/TarPackage"));
const PackageService_1 = require("../PackageManager/PackageService");
const PackageUtils_1 = require("../utils/PackageUtils");
const jws_1 = require("../jws");
const PRIVATE_KEY_1 = Buffer.from('62DEBF78D596673BCE224A85A90DA5AECF6E781D9AADCAEDD4F65586CFE670D2', 'hex');
const ETH_ADDRESS_1 = '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7';
const PRIVATE_KEY_2 = Buffer.from('CCCFA716F4F3242A2D7917DA45B7C07EB306402F0DDAA176915A8475D45CF82A', 'hex');
const ETH_ADDRESS_2 = '0x5C69De5c5bf9D54d7dDCA8Ffbba0d3E013f7E90A';
const WRONG_ETH_ADDRESS = '0xF863aC227B0a0BCA88Cb2Ff45d91632626000000';
const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
const FOO_DIR = path_1.default.join(FIXTURES, 'foo');
const UNSIGNED_FOO_TAR = path_1.default.join(FIXTURES, 'foo.tar.gz');
const SIGNED_FOO_TAR = path_1.default.join(FIXTURES, 'foo_signed.tar.gz');
const EXPIRED_SIGNED_FOO_TAR = path_1.default.join(FIXTURES, 'foo_signed_expired.tar');
const MULTISIGNED_INVALID_FOO_TAR = path_1.default.join(FIXTURES, 'foo_multisigned_invalid.tar');
const MULTISIGNED_CORRUPTED_FOO_TAR = path_1.default.join(FIXTURES, 'foo_multisigned_corrupt.tar');
const MULTISIGNED_FOO_TAR = path_1.default.join(FIXTURES, 'foo_multisigned.tar');
const TEST_ENS = 'foo.test.eth';
describe('PackageSigner', function () {
    describe('fixture creation:', () => {
        // please note that some tests might fail after 180 days after creation
        it.skip('creates a valid signed .tar.gz package', () => __awaiter(this, void 0, void 0, function* () {
            let pkg = yield TarPackage_1.default.create(FOO_DIR);
            pkg = yield PackageSigner.sign(pkg, PRIVATE_KEY_1);
            yield pkg.writePackage(SIGNED_FOO_TAR);
        }));
        it.skip('creates a package with an expired signature', () => __awaiter(this, void 0, void 0, function* () {
            let pkg = yield TarPackage_1.default.create(FOO_DIR);
            pkg = yield PackageSigner.sign(pkg, PRIVATE_KEY_1, {
                expiresIn: 0
            });
            yield pkg.writePackage(EXPIRED_SIGNED_FOO_TAR);
        }));
        it.skip('creates a package with one valid and one invalid signature', () => __awaiter(this, void 0, void 0, function* () {
            let pkg = yield TarPackage_1.default.create(FOO_DIR);
            pkg = yield PackageSigner.sign(pkg, PRIVATE_KEY_1);
            const newEntry = yield PackageUtils_1.toIFile('./baz.txt', 'baz');
            yield pkg.addEntry('./baz.txt', newEntry);
            pkg = yield PackageSigner.sign(pkg, PRIVATE_KEY_2);
            yield pkg.writePackage(MULTISIGNED_INVALID_FOO_TAR);
        }));
        it.skip('creates a package with one valid and one malformed signature', () => __awaiter(this, void 0, void 0, function* () {
            let pkg = yield TarPackage_1.default.create(FOO_DIR);
            pkg = yield PackageSigner.sign(pkg, PRIVATE_KEY_1);
            pkg = yield PackageSigner.sign(pkg, PRIVATE_KEY_2);
            const sig = yield pkg.getContent('_META_/_sig_0x5c69de5c5bf9d54d7ddca8ffbba0d3e013f7e90a.json');
            const sigObj = JSON.parse(sig.toString());
            // modify / corrupt signature
            sigObj.signature = 'BAD' + sigObj.signature.slice(3);
            yield PackageUtils_1.writeEntry(pkg, '_META_/_sig_0x5c69de5c5bf9d54d7ddca8ffbba0d3e013f7e90a.json', JSON.stringify(sigObj));
            yield pkg.writePackage(MULTISIGNED_CORRUPTED_FOO_TAR);
        }));
        it.skip('creates a package with two signatures', () => __awaiter(this, void 0, void 0, function* () {
            let pkg = yield TarPackage_1.default.create(FOO_DIR);
            pkg = yield PackageSigner.sign(pkg, PRIVATE_KEY_1);
            pkg = yield PackageSigner.sign(pkg, PRIVATE_KEY_2);
            yield pkg.writePackage(MULTISIGNED_FOO_TAR);
        }));
    });
    describe('isSigned = async (pkgSpec: PackageData) : Promise<boolean>', function () {
        it('returns true if the package contains ANY (valid/invalid) signatures', () => __awaiter(this, void 0, void 0, function* () {
            const buf = fs_1.default.readFileSync(SIGNED_FOO_TAR);
            const isSigned = yield PackageSigner.isSigned(buf);
            chai_1.assert.isTrue(isSigned);
        }));
        it('returns false if the package contains ZERO signatures', () => __awaiter(this, void 0, void 0, function* () {
            const buf = fs_1.default.readFileSync(UNSIGNED_FOO_TAR);
            const isSigned = yield PackageSigner.isSigned(buf);
            chai_1.assert.isFalse(isSigned);
        }));
        it('accepts package buffers as input', () => __awaiter(this, void 0, void 0, function* () {
            const buf = fs_1.default.readFileSync(SIGNED_FOO_TAR);
            const isSigned = yield PackageSigner.isSigned(buf);
            chai_1.assert.isTrue(isSigned);
        }));
    });
    describe('isValid = async (pkgSpec: PackageData) : Promise<boolean>', function () {
        it('returns true if the package is signed AND ALL signatures are <valid>: the signed digests match and cover the actual digests/current state of the package', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(MULTISIGNED_FOO_TAR);
            const result = yield PackageSigner.isValid(pkg);
            chai_1.assert.isTrue(result);
        }));
        it('returns false if the package is unsigned', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(UNSIGNED_FOO_TAR);
            const result = yield PackageSigner.isValid(pkg);
            chai_1.assert.isFalse(result);
        }));
        it('returns false if the package contains ANY invalid/malformed signature', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(MULTISIGNED_CORRUPTED_FOO_TAR);
            const result = yield PackageSigner.isValid(pkg);
            chai_1.assert.isFalse(result);
        }));
        // package modification invalidates the signature
        it.skip('returns false if the package contents to do not match the signature (the package was modified)', () => __awaiter(this, void 0, void 0, function* () {
        }));
        it('returns false if the package contents are not covered 100% by all signatures', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(MULTISIGNED_INVALID_FOO_TAR);
            const result = yield PackageSigner.isValid(pkg);
            chai_1.assert.isFalse(result);
        }));
        it('returns false if the package contains ANY expired signature', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield PackageService_1.toPackage(EXPIRED_SIGNED_FOO_TAR);
            const result = yield PackageSigner.isValid(pkg);
            chai_1.assert.isFalse(result);
        }));
    });
    describe('isTrusted = async (pkgSpec: PackageData, publicKeyInfo?: PublicKeyInfo) : Promise<boolean>', function () {
        it.skip('returns true if isValid returns true AND the signers public keys have valid certificates', () => __awaiter(this, void 0, void 0, function* () {
        }));
        it.skip('returns true if isValid returns true AND publicKeyInfo is a valid ENS name and in the list of signers', () => __awaiter(this, void 0, void 0, function* () {
        }));
        it.skip('returns true if isValid returns true AND publicKeyInfo is an explicitly trusted Ethereum address and in the list of signers', () => __awaiter(this, void 0, void 0, function* () {
        }));
    });
    describe(`sign = async (pkgSpec: PackageData, privateKey : string | Buffer | ISigner, pkgPathOut? : string) : Promise<IPackage>`, function () {
        it('signs an unsigned tar package when passed a package buffer + private key', () => __awaiter(this, void 0, void 0, function* () {
            const buf = fs_1.default.readFileSync(UNSIGNED_FOO_TAR);
            let isSigned = yield PackageSigner.isSigned(buf);
            chai_1.assert.isFalse(isSigned);
            const pkgSigned = yield PackageSigner.sign(buf, Buffer.from(PRIVATE_KEY_1), { algorithm: jws_1.ALGORITHMS.EC_SIGN });
            chai_1.assert.isDefined(pkgSigned);
            isSigned = yield PackageSigner.isSigned(pkgSigned);
            chai_1.assert.isTrue(isSigned);
        }));
        it('signs an unsigned tar package when passed a package buffer + private key', () => __awaiter(this, void 0, void 0, function* () {
            const buf = fs_1.default.readFileSync(UNSIGNED_FOO_TAR);
            let isSigned = yield PackageSigner.isSigned(buf);
            chai_1.assert.isFalse(isSigned);
            const pkgSigned = yield PackageSigner.sign(buf, Buffer.from(PRIVATE_KEY_1), { algorithm: jws_1.ALGORITHMS.ETH_SIGN });
            chai_1.assert.isDefined(pkgSigned);
            isSigned = yield PackageSigner.isSigned(pkgSigned);
            chai_1.assert.isTrue(isSigned);
        }));
        it.skip('signs a package using a private key certificate', () => __awaiter(this, void 0, void 0, function* () {
        }));
        it.skip('signs a package using a private key alias from the keystore', () => __awaiter(this, void 0, void 0, function* () {
        }));
        it.skip('signs a package using a private key file path', () => __awaiter(this, void 0, void 0, function* () {
        }));
        it.skip('signs a package using an ISigner service', () => __awaiter(this, void 0, void 0, function* () {
        }));
        it('adds a signature to a signed package when different keys are used', () => __awaiter(this, void 0, void 0, function* () {
            const buf = fs_1.default.readFileSync(SIGNED_FOO_TAR);
            const verificationInfoBefore = yield PackageSigner.verify(buf);
            // assert that package is only signed by ETH_ADDRESS_1
            chai_1.assert.equal(verificationInfoBefore.signers.length, 1);
            chai_1.assert.isTrue(yield SignerUtils.containsSignature(verificationInfoBefore.signers, ETH_ADDRESS_1), `package should be signed by ${ETH_ADDRESS_1}`);
            // sign package with different key
            const pkgSigned = yield PackageSigner.sign(buf, Buffer.from(PRIVATE_KEY_2));
            chai_1.assert.isDefined(pkgSigned);
            // assert that a new signature by ETH_ADDRESS_2 was added:
            const verificationInfoAfter = yield PackageSigner.verify(pkgSigned);
            chai_1.assert.equal(verificationInfoAfter.signers.length, 2);
            chai_1.assert.isTrue(yield SignerUtils.containsSignature(verificationInfoBefore.signers, ETH_ADDRESS_1), 'after signing it with key2 it should contain key1\'s signatures');
            chai_1.assert.isTrue(yield SignerUtils.containsSignature(verificationInfoAfter.signers, ETH_ADDRESS_2), 'after signing it with key2 it should contain key2\'s signatures');
        }));
        it('overrides the signature of a signed package when same key is used and extends expiration field', () => __awaiter(this, void 0, void 0, function* () {
            const buf = fs_1.default.readFileSync(SIGNED_FOO_TAR);
            const pkg = yield PackageService_1.toPackage(buf);
            const jws = yield SignerUtils.getSignature(pkg, ETH_ADDRESS_1);
            if (!jws) {
                return chai_1.assert.fail('Package should already be signed by: ' + ETH_ADDRESS_1);
            }
            const { exp: exp1 } = jws.payload;
            // re-sign
            const pkgSigned = yield PackageSigner.sign(buf, Buffer.from(PRIVATE_KEY_1));
            chai_1.assert.isDefined(pkgSigned);
            const verificationInfo = yield PackageSigner.verify(pkgSigned);
            const { signers } = verificationInfo;
            chai_1.assert.equal(signers.length, 1, 'after re-signing package should still only contain 1 signature');
            const signer = signers[0];
            chai_1.assert.isDefined(signer.exp, 'new signature should have valid expiration date');
            chai_1.assert.notEqual(exp1, signer.exp, 'the new expiration date should not be the old one (extended expiration)');
        }));
    });
    describe(`verify = async (pkgSpec: PackageData, publicKeyInfo?: PublicKeyInfo) : Promise<IVerificationResult>`, function () {
        it('verifies a local package without an ethereum address', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield TarPackage_1.default.from(SIGNED_FOO_TAR);
            const verificationResult = yield PackageSigner.verify(pkg);
            chai_1.assert.isTrue(verificationResult.isValid, 'the package should be valid');
            chai_1.assert.isDefined(verificationResult.signers.find(info => info.address.toLowerCase() === ETH_ADDRESS_1.toLowerCase()), 'the ethereum address should be present in list of signers');
            chai_1.assert.isFalse(verificationResult.isTrusted, 'without identity info about the signer the package cannot be trusted');
        }));
        it('verifies a local package against an ethereum address', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield TarPackage_1.default.from(SIGNED_FOO_TAR);
            const verificationResult = yield PackageSigner.verify(pkg, { addressOrEnsName: ETH_ADDRESS_1 });
            chai_1.assert.isTrue(verificationResult.isValid, 'the package should be valid');
            chai_1.assert.isDefined(verificationResult.signers.find(info => info.address.toLowerCase() === ETH_ADDRESS_1.toLowerCase()), 'the ethereum address should be present in list of signers');
            chai_1.assert.isTrue(verificationResult.isTrusted, 'when provided a trusted address that matches a signer isTrusted should be true');
        }));
        it('verifies a local package against an ethereum ENS name', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield TarPackage_1.default.from(SIGNED_FOO_TAR);
            const verificationResult = yield PackageSigner.verify(pkg, { addressOrEnsName: TEST_ENS });
            chai_1.assert.isTrue(verificationResult.isValid, 'the package should be valid');
            chai_1.assert.isDefined(verificationResult.signers.find(info => info.address.toLowerCase() === ETH_ADDRESS_1.toLowerCase()), 'the ethereum address should be present in list of signers');
            chai_1.assert.isTrue(verificationResult.isTrusted, 'with ENS as identity info the package becomes trusted');
        }));
        it.skip('verifies externally hosted packages when passed a valid PackageQuery', () => __awaiter(this, void 0, void 0, function* () {
            // npm example
        }));
        it.skip('for meaning and tests of isValid and isTrusted see above tests', () => { });
        /*
        it.skip('returns isValid=false if the package has a valid signature but the provided key info is not matching the signature', async () => {
          const verificationResult = await PackageSigner.verify(SIGNED_FOO_TAR, WRONG_ETH_ADDRESS)
          console.log('verification res', verificationResult)
          assert.isTrue(verificationResult.isValid, 'the package should be valid')
          assert.isFalse(verificationResult.isTrusted, 'without identity info / cert packages cannot be trusted')
        })
        it.skip('returns isValid=false if the package has an invalid signature', async () => {
          const verificationResult = await PackageSigner.verify(SIGNED_FOO_TAR, WRONG_ETH_ADDRESS)
          console.log('verification res', verificationResult)
          assert.isTrue(verificationResult.isValid, 'the package should be valid')
          assert.isFalse(verificationResult.isTrusted, 'without identity info / cert packages cannot be trusted')
        })
        */
        it.skip('returns isTrusted=true ONLY if the package is signed, the signature matches the archive\'s checksums, is not expired and the public key is explicitly trusted or bound to a trusted identity via certificate, ENS or similar means', () => __awaiter(this, void 0, void 0, function* () {
        }));
    });
});
//# sourceMappingURL=PackageSigner.spec.js.map