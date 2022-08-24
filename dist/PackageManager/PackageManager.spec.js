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
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const chai_1 = require("chai");
const PackageManager_1 = __importDefault(require("./PackageManager"));
const TarPackage_1 = __importDefault(require("./TarPackage"));
const SignerUtils_1 = require("../PackageSigner/SignerUtils");
const Cache_1 = require("./Cache");
const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
const UNSIGNED_FOO_TAR = path_1.default.join(FIXTURES, 'foo.tar.gz');
const PACKAGE_URL = 'https://github.com/ethereum/grid-ui/releases/download/v1.6.0-master_1569996211/grid-ui_1.6.0_master.zip';
const REPOSITORY_URL = 'https://github.com/ethereum/grid-ui';
const PACKAGE_QUERY_LATEST = 'github:ethereum/grid-ui';
const LATEST_VERSION = '1.6.1';
const PRIVATE_KEY_1 = Buffer.from('62DEBF78D596673BCE224A85A90DA5AECF6E781D9AADCAEDD4F65586CFE670D2', 'hex');
const ETH_ADDRESS_1 = '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7';
describe('PackageManager', () => {
    describe('constructor(options?: any) {}', function () {
        describe('options.cache', () => {
            it('creates a persistent cache when passed a directory path', () => __awaiter(this, void 0, void 0, function* () {
            }));
        });
    });
    describe('IRepository extensibility', function () {
        class TestRepo {
            constructor() {
                this.name = 'TestRepo';
            }
            listReleases(options) {
                return __awaiter(this, void 0, void 0, function* () {
                    return [{ fileName: 'a' }, { fileName: 'b' }];
                });
            }
        }
        let pm;
        before(() => {
            pm = new PackageManager_1.default();
        });
        describe('async addRepository(name: string, repo: ConstructorOf<IRepository>) : Promise<void>', function () {
            it('adds a custom repository implementation to extend backend support', () => __awaiter(this, void 0, void 0, function* () {
                yield pm.addRepository('test', TestRepo);
                const releases = yield pm.listPackages('test:testOwner/testProject', {
                    filterInvalid: false
                });
                chai_1.assert.equal(releases.length, 2);
            }));
        });
        describe('async getRepository(name: string) : Promise<IRepository | undefined>', function () {
            it('creates a new instance of the IRepository implementation registered with <name>', () => __awaiter(this, void 0, void 0, function* () {
                const repo = yield pm.getRepository('test');
                if (!repo) {
                    return chai_1.assert.fail();
                }
                const releases = yield repo.listReleases();
                chai_1.assert.equal(releases.length, 2);
            }));
        });
        describe('async listRepositories() : Promise<Array<string>>', function () {
            it('lists all the names of available repositories', () => __awaiter(this, void 0, void 0, function* () {
                const repoNames = yield pm.listRepositories();
                chai_1.assert.equal(repoNames.length, 9);
                chai_1.assert.includeMembers(repoNames, ['github', 'test']);
            }));
        });
        describe('async removeRepository(prefix: string) : Promise<boolean>', function () {
            it('removes a repository', () => __awaiter(this, void 0, void 0, function* () {
                yield pm.removeRepository('test');
                // should throw:
                pm.listPackages('test:testOwner/testProject')
                    .then(() => {
                    chai_1.assert.fail();
                })
                    .catch((err) => {
                    chai_1.assert.isDefined(err);
                });
            }));
        });
    });
    describe('info()', function () {
        it('display some basic info about this library', () => {
            chai_1.assert.isDefined(new PackageManager_1.default().info());
        });
    });
    describe('async clearCache() : Promise<void>', function () {
        this.timeout(60 * 1000);
        it.skip('removes all saved data (http responses, packages) from cache', () => __awaiter(this, void 0, void 0, function* () {
            // pre-condition: cache dir is empty
            const CACHE_PATH = path_1.default.join(FIXTURES, 'cache');
            let files = fs_1.default.readdirSync(CACHE_PATH);
            // TODO assert.equal(files.length, 1) // should contain only the invalid file
            const pm = new PackageManager_1.default({
                cache: CACHE_PATH
            });
            let p = yield pm.getPackage('github:ethereum/grid-ui');
            files = fs_1.default.readdirSync(CACHE_PATH);
            chai_1.assert.equal(files.length, 2);
            const pkg = yield pm.getPackage('github:ethereum/grid-ui');
            if (!pkg) {
                return chai_1.assert.fail();
            }
            const entries = yield pkg.getEntries();
            // console.log('valid pkg?', entries.map(e => e.relativePath))
            // console.log('index', (await pkg.getContent('index.html')).toString())
            yield pm.clearCache();
            files = fs_1.default.readdirSync(CACHE_PATH);
            chai_1.assert.equal(files.length, 1);
        }));
    });
    describe('async createPackage(srcDirPathOrName: string, options?: PackOptions) : Promise<IPackage>', function () {
        const FOO_DIR = path_1.default.join(FIXTURES, 'foo');
        const FOO_NESTED_DIR = path_1.default.join(FIXTURES, 'foo_nested');
        it('creates a new package (default: tar) in memory with the contents of srcDirPath', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            const pkg = yield pm.createPackage(FOO_DIR);
            chai_1.assert.isDefined(pkg);
            const foo = yield pkg.getContent('foo.txt');
            chai_1.assert.equal(foo.toString(), 'foo');
        }));
        it('creates an empty package', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            const pkg = yield pm.createPackage(FOO_DIR);
            chai_1.assert.isDefined(pkg);
            const foo = yield pkg.getContent('foo.txt');
            chai_1.assert.equal(foo.toString(), 'foo');
        }));
        it('recursively packs nested directories in tar packages', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            const pkg = yield pm.createPackage(FOO_NESTED_DIR);
            chai_1.assert.isDefined(pkg);
            const baz = yield pkg.getContent('baz/baz.txt');
            chai_1.assert.equal(baz.toString(), 'baz');
        }));
        it('recursively packs nested directories in zip packages', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            const pkg = yield pm.createPackage(FOO_NESTED_DIR, {
                type: 'zip'
            });
            chai_1.assert.isDefined(pkg);
            const baz = yield pkg.getContent('baz/baz.txt');
            chai_1.assert.equal(baz.toString(), 'baz');
        }));
        it.skip('handles packages in subfolders by including them', () => { });
        it('throws if srcDirPath is not a valid dir path', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            yield pm.createPackage('').then(() => {
                chai_1.assert.fail();
            }).catch(err => {
                chai_1.assert.isDefined(err);
            });
        }));
        it.skip('supports glop patterns', () => { });
        it.skip('detects .npmignore files', () => { });
        it.skip('writes the package to disk if a valid outPath is provided', () => { });
    });
    describe('async listPackages(spec: PackageQuery, options?: FetchOptions) : Promise<Array<IRelease>>', function () {
        this.timeout(60 * 1000);
        it('lists all available & valid packages for a given PackageQuery', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            const packages = yield pm.listPackages('github:ethereum/grid-ui');
            // TODO mock http
            chai_1.assert.equal(packages.length, 30);
        }));
        it('lists packages for repo urls ', () => __awaiter(this, void 0, void 0, function* () {
            const gethStore = 'https://gethstore.blob.core.windows.net';
            const releases = yield new PackageManager_1.default().listPackages(gethStore);
            chai_1.assert.isTrue(releases.length > 100);
        }));
        it('includes packages from a user defined cache path ', () => __awaiter(this, void 0, void 0, function* () {
        }));
        // TODO usage of fetch options
    });
    describe('async resolve(spec: PackageQuery, options?: ResolvePackageOptions): Promise<IRelease | undefined>', function () {
        it('resolves a PackageQuery to a specific release - this fetches only metadata and not the package itself', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            const release = yield pm.resolve(PACKAGE_QUERY_LATEST);
            chai_1.assert.isDefined(release);
            chai_1.assert.equal(release.version, '1.6.1');
        }));
        it('returns undefined if non of the packages matches', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            // version > latest should not be possible
            const release = yield pm.resolve('github:ethereum/grid-ui@>=1.6.2');
            chai_1.assert.isUndefined(release);
        }));
        it('can be wrapped with a mem-cache', () => __awaiter(this, void 0, void 0, function* () {
            const cache = new Cache_1.MemCache();
            const pm = new PackageManager_1.default({
                cache
            });
            const release = yield pm.resolve('github:ethereum/grid-ui@>=1.6.1');
            const key = (cache.keys())[0];
            const cached = yield cache.get(key);
            chai_1.assert.deepEqual(release, cached);
        }));
        it('can be wrapped with a persistent cache', () => __awaiter(this, void 0, void 0, function* () {
            const CACHE_PATH = path_1.default.join(FIXTURES, 'TestCache2');
            const pm = new PackageManager_1.default({
                cache: CACHE_PATH
            });
            const release = yield pm.resolve('github:ethereum/grid-ui@>=1.6.1');
            // assert.deepEqual(release, cached)
        }));
    });
    /* TODO remove
    describe('async fetchPackage(release: IRelease, options?: DownloadPackageOptions) : Promise<IPackage | undefined>', function() {
      this.timeout(60 * 1000)
      it('fetches the package data (e.g. release asset on github) for a given IRelease', async () => {
        const pm = new PackageManager()
        const release = await pm.resolve(PACKAGE_QUERY_LATEST)
        if (!release) {
          return assert.fail()
        }
        const pkg = await pm.fetchPackage(release)
        assert.isDefined(pkg)
      })
    })
  
    describe('async downloadPackage(pkgSpec: PackageQuery, dest: string = ".") : Promise<IPackage>', function() {
      this.timeout(60 * 1000)
      it('downloads a package to disk', () => {
        
      })
      it('allows to specify a proxy server to avoid cors issues during package download in the browser', async () => {
        const pkg = await new PackageManager().downloadPackage('github:ethereum/grid-ui', {
          proxy: 'https://cors-anywhere.herokuapp.com/',
          // proxy will block requests not coming from browser -> sorry
          headers: {
            Origin: null,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36'
          }
        })
        assert.isDefined(pkg)
      })
    })
    */
    describe('async getPackage(pkgSpec: PackageQuery | PackageData | ResolvePackageOptions, options? : ResolvePackageOptions) : Promise<IPackage | undefined>', function () {
        this.timeout(60 * 1000);
        it('accepts an IPackage as pkgSpec (pass-through)', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield TarPackage_1.default.from(UNSIGNED_FOO_TAR);
            const pkg2 = yield new PackageManager_1.default().getPackage(pkg);
            if (pkg2 === undefined) {
                return chai_1.assert.fail();
            }
            const content = yield pkg2.getContent('./foo/foo.txt');
            chai_1.assert.equal(content.toString(), 'foo');
        }));
        it('accept a Buffer as pkgSpec', () => __awaiter(this, void 0, void 0, function* () {
            const pkgBuf = fs_1.default.readFileSync(UNSIGNED_FOO_TAR);
            const pkg = yield new PackageManager_1.default().getPackage(pkgBuf);
            if (pkg === undefined) {
                return chai_1.assert.fail();
            }
            const content = yield pkg.getContent('./foo/foo.txt');
            chai_1.assert.equal(content.toString(), 'foo');
        }));
        it('accepts a string / file path as pkgSpec', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield new PackageManager_1.default().getPackage(UNSIGNED_FOO_TAR);
            if (pkg === undefined) {
                return chai_1.assert.fail();
            }
            const content = yield pkg.getContent('./foo/foo.txt');
            chai_1.assert.equal(content.toString(), 'foo');
        }));
        it('accepts a string / repository URL as pkgSpec', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield new PackageManager_1.default().getPackage(REPOSITORY_URL);
            if (pkg === undefined) {
                return chai_1.assert.fail();
            }
            chai_1.assert.isDefined(pkg.metadata);
            if (!pkg.metadata) {
                return chai_1.assert.fail();
            }
            chai_1.assert.equal(pkg.metadata.version, LATEST_VERSION);
        }));
        it.skip('accepts a string / package URL as pkgSpec', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield new PackageManager_1.default().getPackage(PACKAGE_URL);
            if (pkg === undefined) {
                return chai_1.assert.fail();
            }
            chai_1.assert.isDefined(pkg.metadata);
            if (!pkg.metadata) {
                return chai_1.assert.fail();
            }
            chai_1.assert.equal(pkg.metadata.version, '1.6.0');
        }));
        it('accepts a string / PackageQuery as pkgSpec', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield new PackageManager_1.default().getPackage(PACKAGE_QUERY_LATEST);
            if (pkg === undefined) {
                return chai_1.assert.fail();
            }
            const index = yield pkg.getContent('index.html');
            chai_1.assert.isDefined(index);
        }));
        it.skip('downloads a workflow package', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield new PackageManager_1.default().getPackage('ethpkg:0x585c34f863e4064bdefa52305e3e7c89d39f98cf/foo-1.0.0.tar');
            if (pkg === undefined) {
                return chai_1.assert.fail();
            }
            const index = yield pkg.getContent('index.js');
            chai_1.assert.isDefined(index);
        }));
        it('accepts an IRelease as pkgSpec', () => {
        });
        it('accepts a state listener to listen for e.g. download progress changes', () => {
        });
        it('has a short form which accepts a single ResolvePackageOptions object', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield new PackageManager_1.default().getPackage({
                spec: 'github:ethereum/grid-ui',
                version: '1.6.0'
            });
            if (pkg === undefined) {
                return chai_1.assert.fail();
            }
            if (!pkg.metadata) {
                return chai_1.assert.fail();
            }
            chai_1.assert.equal(pkg.metadata.version, '1.6.0');
        }));
        it('accepts a proxy server to avoid cors issues during package download in the browser', () => __awaiter(this, void 0, void 0, function* () {
            const pkg = yield new PackageManager_1.default().getPackage('github:ethereum/grid-ui', {
                proxy: 'https://cors-anywhere.herokuapp.com/',
                // proxy will block requests not coming from browser
                headers: {
                    Origin: null,
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36'
                }
            });
            chai_1.assert.isDefined(pkg);
        }));
        it('tries to create the download directory if it doesn\'t exist yet', () => {
        });
        it('can extract all package contents to disk test tar+zip', () => {
        });
    });
    describe('ISigner extensibility', function () {
        class MySigner {
            constructor() {
                this.type = 'ISigner';
                this.name = 'MySigner';
            }
            ecSign(msg) {
                throw new Error('not implemented');
            }
            ethSign(msg) {
                throw new Error('not implemented');
            }
            getAddress() {
                throw new Error('not implemented');
            }
        }
        describe('async addSigner(signer: ISigner) : Promise<void>', function () {
            it('adds an ISigner implementation', () => __awaiter(this, void 0, void 0, function* () {
                yield new PackageManager_1.default().addSigner('my-signer', new MySigner());
            }));
        });
        describe('async listSigners() : Promise<Array<string>>', function () {
            it('lists all available signers', () => __awaiter(this, void 0, void 0, function* () {
                const signers = yield new PackageManager_1.default().listSigners();
                chai_1.assert.lengthOf(signers, 3); // metamask, geth, private key
            }));
        });
        describe('async getSigner(name: string) : Promise<ISigner | undefined>', function () {
            it('returns the signer with <name>', () => __awaiter(this, void 0, void 0, function* () {
                const signer = yield new PackageManager_1.default().getSigner('geth');
                chai_1.assert.isDefined(signer);
            }));
        });
    });
    describe('async signPackage(pkg: PackageData, privateKey: Buffer, pkgPathOut? : string) : Promise<IPackage>', function () {
        it('signs an unsigned local package using a private key', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            const signed = yield pm.signPackage(UNSIGNED_FOO_TAR, PRIVATE_KEY_1);
            // TODO const signatures = await signed.getSignatures()
            const signatures = yield SignerUtils_1.getSignatureEntriesFromPackage(signed);
            chai_1.assert.lengthOf(signatures, 1);
        }));
        it.skip('signs an unsigned local package using an ISigner', () => __awaiter(this, void 0, void 0, function* () {
        }));
    });
    describe('async verifyPackage(pkg : IPackage, addressOrEnsName? : string) : Promise<IVerificationResult>', function () {
        it('verifies a signed package', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            const signed = yield pm.signPackage(UNSIGNED_FOO_TAR, PRIVATE_KEY_1);
            const verificationResult = yield pm.verifyPackage(signed);
            chai_1.assert.isTrue(verificationResult.isValid);
            chai_1.assert.isFalse(verificationResult.isTrusted, 'without public key info the package cannot be trusted');
        }));
        it('verifies a signed package against a trusted public key', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            const signed = yield pm.signPackage(UNSIGNED_FOO_TAR, PRIVATE_KEY_1);
            const verificationResult = yield pm.verifyPackage(signed, { addressOrEnsName: ETH_ADDRESS_1 });
            chai_1.assert.isTrue(verificationResult.isValid);
            chai_1.assert.isTrue(verificationResult.isTrusted);
        }));
    });
    describe('async publishPackage(pkgSpec: PackageData, repoSpecifier: string = "ipfs")', function () {
        it('publishes a local package to an IRepository', () => {
        });
    });
});
//# sourceMappingURL=PackageManager.spec.js.map