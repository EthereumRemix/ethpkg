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
const Fetcher_1 = __importDefault(require("../Fetcher"));
const PackageSigner = __importStar(require("../PackageSigner"));
const IRepository_1 = require("../Repositories/IRepository");
const Fetcher_2 = require("../Fetcher/Fetcher");
const PackageService_1 = require("./PackageService");
const Cache_1 = require("./Cache");
const TarPackage_1 = __importDefault(require("./TarPackage"));
const ZipPackage_1 = __importDefault(require("./ZipPackage"));
const util_1 = require("../util");
const RepositoryManager_1 = __importDefault(require("../Repositories/RepositoryManager"));
const util_2 = require("util");
const IStateListener_1 = require("../IStateListener");
const KeyStore_1 = __importDefault(require("../PackageSigner/KeyStore"));
const PackageSigner_1 = require("../PackageSigner");
const FilenameUtils_1 = require("../utils/FilenameUtils");
const SignerManager_1 = __importDefault(require("../Signers/SignerManager"));
// browser / webpack support
if (!fs_1.default.existsSync) {
    fs_1.default.existsSync = () => false;
}
// we need to tell th ecahe how to restore persisted objects
const packageFactory = (info) => __awaiter(void 0, void 0, void 0, function* () {
    const { ctor, data } = info;
    if (ctor === undefined) {
        return undefined;
    }
    if (!data) {
        return data;
    }
    if (ctor === 'Object') {
        return data;
    }
    // FIXME restore fileName
    else if (ctor === 'ZipPackage') {
        const { filePath, buffer, metadata } = data;
        const pkg = yield new ZipPackage_1.default(filePath).loadBuffer(buffer);
        pkg.metadata = metadata;
        return pkg;
    }
    else if (ctor === 'TarPackage') {
        const { filePath, buffer, metadata } = data;
        const pkg = yield new TarPackage_1.default(filePath).loadBuffer(buffer);
        pkg.metadata = metadata;
        return pkg;
    }
    else {
        throw new Error('De-serialization error: unknown ctor' + ctor);
    }
});
class PackageManager {
    constructor(options) {
        this.cache = new Cache_1.NoCache();
        this.repoManager = new RepositoryManager_1.default();
        this.signerManager = new SignerManager_1.default();
        let cacheInit = false;
        if (options && options.cache) {
            if (Cache_1.instanceOfICache(options.cache)) {
                this.cache = options.cache;
                cacheInit = true;
            }
            else if (util_1.isDirSync(options.cache)) {
                this.cache = new Cache_1.PersistentJsonCache(options.cache, packageFactory);
                cacheInit = true;
            }
            else {
                throw new Error('Invalid cache path provided: not accessible -' + options.cache);
            }
        }
        if (cacheInit) {
            this.resolve = Cache_1.withCache(this.cache, this.resolve.bind(this), (spec) => `resolve:${spec}`);
            this.getPackage = Cache_1.withCache(this.cache, this.getPackage.bind(this));
        }
    }
    info() {
        return 'ethpkg version: ' + require('../../package.json').version;
    }
    addRepository(name, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repoManager.addRepository(name, repo);
        });
    }
    getRepository(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repoManager.getRepository(name);
        });
    }
    listRepositories() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repoManager.listRepositories();
        });
    }
    removeRepository(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repoManager.removeRepository(name);
        });
    }
    clearCache() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cache) {
                yield this.cache.clear();
            }
        });
    }
    createPackage(srcDirPathOrName, { type = 'tar', listener = () => { }, filePath = undefined, fileName = undefined, compressed = true, overwrite = false } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const createPackageOptions = {
                listener: listener,
                compress: true
            };
            listener(IStateListener_1.PROCESS_STATES.CREATE_PACKAGE_STARTED);
            // TODO determine the package type e.g zip / tar based on out path
            let pkg;
            if (type === 'zip') {
                pkg = yield ZipPackage_1.default.create(srcDirPathOrName, createPackageOptions);
            }
            else {
                pkg = yield TarPackage_1.default.create(srcDirPathOrName, createPackageOptions);
            }
            if (fileName) {
                const ext = FilenameUtils_1.getExtension(pkg.fileName);
                pkg.fileName = `${fileName}${ext}`;
            }
            listener(IStateListener_1.PROCESS_STATES.CREATE_PACKAGE_FINISHED, { name: pkg.fileName, pkg });
            if (filePath) {
                yield pkg.writePackage(filePath, {
                    overwrite
                });
            }
            return pkg;
        });
    }
    listPackages(spec, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetcher = new Fetcher_1.default(this.repoManager);
            const releases = yield fetcher.listReleases(spec, options);
            if (options && options.cache) {
                if (typeof options.cache === 'string') {
                    // FIXME fs.existsSync(options.cache)
                }
                else if (util_2.isArray(options.cache)) {
                }
            }
            return releases;
        });
    }
    resolve(spec, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetcher = new Fetcher_1.default(this.repoManager);
            const release = yield fetcher.getRelease(spec, options);
            return release;
        });
    }
    /**
     * Downloads a package to disk
     * A combination of resolve, fetchPackage and verify. Steps can be specified through download options
     */
    downloadPackage(release, { proxy = undefined, headers = undefined, onDownloadProgress = undefined, listener = () => { }, destPath = undefined, extract = false, verify = true } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetcher = new Fetcher_1.default(this.repoManager);
            const buf = yield fetcher.downloadPackage(release, {
                proxy,
                headers,
                onDownloadProgress,
                listener
            });
            const pkg = yield PackageService_1.toPackage(buf, release); // != this.getPackage
            // TODO if download options verify
            if (verify) {
                /*
                let addressOrEnsName = undefined
                if (verifyWith.length > 0) {
                  let author = verifyWith[0]
                  if (typeof author === 'string') {
                    addressOrEnsName = author
                  } else if ('address' in author) {
                    addressOrEnsName = author.address
                  }
                }
                */
            }
            // make sure destPath exists and is dir
            if (destPath) {
                destPath = path_1.default.resolve(destPath);
                // FIXME handle destPath = full file path: path/to/file/my-name.tar
                if (util_1.isDirPath(destPath)) {
                    if (!util_1.isDirSync(destPath)) {
                        // TODO try create dir if non-existent dir path
                        fs_1.default.mkdirSync(destPath, {
                            recursive: true
                        });
                    }
                    else {
                        destPath: undefined; // invalid: reset
                    }
                }
            }
            if (destPath && util_1.isDirSync(destPath)) {
                // don't overwrite extract dest path
                let _pkgDestPath = path_1.default.join(destPath, release.fileName);
                pkg.filePath = _pkgDestPath;
                yield pkg.writePackage(_pkgDestPath);
                if (pkg.metadata) {
                    pkg.metadata.remote = false; // indicate that local version is available
                }
                if (extract) {
                    listener(IStateListener_1.PROCESS_STATES.EXTRACT_PACKAGE_STARTED, { release });
                    yield pkg.extract(destPath, {
                        listener
                    });
                    listener(IStateListener_1.PROCESS_STATES.EXTRACT_PACKAGE_FINISHED, { release });
                }
            }
            return pkg;
        });
    }
    /**
     * Creates and returns an IPackage based on a filepath, url, or package specifier
     */
    getPackage(pkgSpec, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pkgSpec) {
                throw new Error('Invalid package specification: empty or undefined');
            }
            // pkgSpec is already available as buffer, File (browser), IPackage or file path => no fetch
            if (PackageService_1.instanceOfPackageData(pkgSpec)) {
                return PackageService_1.toPackage(pkgSpec);
            }
            // test for invalid file paths not handled by instanceOfPackageData()
            if (typeof pkgSpec === 'string' && util_1.isFilePath(pkgSpec)) {
                if (!fs_1.default.existsSync(pkgSpec)) {
                    throw new Error(`Path does not point to valid package: "${pkgSpec}"`);
                }
            }
            // check if the short-hand one argument form is used and extract <PackageQuery>pkgSpec from options before we try to resolve them
            if (Fetcher_2.instanceofResolvePackageOptions(pkgSpec)) {
                if (options) {
                    throw new Error('ResolvePackageOptions are provided multiple times');
                }
                if (pkgSpec.spec === undefined) {
                    throw new Error('No package specifier provided');
                }
                options = pkgSpec;
                pkgSpec = pkgSpec.spec;
            }
            // try to resolve package queries to IRelease
            if (Fetcher_2.instanceOfPackageQuery(pkgSpec)) {
                try {
                    const release = yield this.resolve(pkgSpec, options);
                    // console.log('resolved to', release)
                    if (!release) {
                        throw new Error(`Package query "${pkgSpec}" could not be resolved`);
                    }
                    pkgSpec = release;
                }
                catch (error) {
                    // TODO log error here
                    // console.log('error during download', error)
                    throw error;
                }
            }
            // download IRelease if it does not exist in cache
            if (IRepository_1.instanceOfIRelease(pkgSpec)) {
                const release = pkgSpec;
                let cachedDataPath = (options && options.cache) ? path_1.default.join(options.cache, release.fileName) : undefined;
                // TODO write tests
                if (options && options.cache && fs_1.default.existsSync(options.cache)) {
                    if (cachedDataPath && fs_1.default.existsSync(cachedDataPath)) {
                        const pkg = yield PackageService_1.toPackage(cachedDataPath);
                        pkg.metadata = release;
                        pkg.filePath = cachedDataPath;
                        pkg.metadata.remote = false; // indicate that it was loaded from cache
                        return pkg;
                    }
                }
                // if cache is provided but no explicit download path we still download to cache
                if (options && !options.destPath && options.cache) {
                    options.destPath = options.cache;
                }
                const pkg = yield this.downloadPackage(release, options);
                if (pkg.metadata && options && options.cache) {
                    fs_1.default.writeFileSync(path_1.default.join(options.cache, `${pkg.fileName}.json`), JSON.stringify(pkg.metadata));
                }
                return pkg;
            }
            throw new Error(`Unsupported input type for package: "${pkgSpec}"`);
        });
    }
    /**
     * Helps to select or create a designated signing key
     // path where to search for keys
     */
    getSigningKey(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const _keyStore = new KeyStore_1.default(options.keyStore);
            return _keyStore.getKey(options);
        });
    }
    listKeys() {
        return __awaiter(this, void 0, void 0, function* () {
            const _keyStore = new KeyStore_1.default();
            return _keyStore.listKeys();
        });
    }
    addSigner(name, signer) {
        return __awaiter(this, void 0, void 0, function* () {
            this.signerManager.addSigner(name, signer);
        });
    }
    listSigners() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.signerManager.listSigners();
        });
    }
    getSigner(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.signerManager.getSigner(name);
        });
    }
    /**
     * Signs a package or directory
     */
    signPackage(pkg, privateKey, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO support all package specifier options that this.getPackage supports
            return PackageSigner.sign(pkg, privateKey, options);
        });
    }
    verifyPackage(pkg, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return PackageSigner.verify(pkg, options);
        });
    }
    /**
     *
     */
    publishPackage(pkgSpec, { repository = undefined, listener = () => { }, signPackage = undefined, keyInfo = undefined, credentials = undefined } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!repository) {
                throw new Error('No repository specified for upload');
            }
            const repo = yield this.repoManager.getRepository(repository);
            if (!repo) {
                throw new Error(`Repository not found for specifier: "${JSON.stringify(repository)}"`);
            }
            let pkg;
            if (typeof pkgSpec === 'string' && util_1.isDirSync(pkgSpec)) {
                pkg = yield this.createPackage(pkgSpec, {
                    listener
                });
            }
            else {
                pkg = yield this.getPackage(pkgSpec, {
                    listener
                });
            }
            if (!pkg) {
                throw new Error('Package not found or could not be created');
            }
            // default to signing for unsigned packages
            const _isSigned = yield PackageSigner_1.isSigned(pkg);
            signPackage = (typeof signPackage === undefined) ? !_isSigned : signPackage;
            if (signPackage) {
                if (!keyInfo) {
                    throw new Error('Cannot sign package without keys');
                }
                keyInfo.listener = listener;
                const privateKey = yield this.getSigningKey(keyInfo);
                pkg = yield this.signPackage(pkg, privateKey, {
                    listener
                });
            }
            if (credentials && typeof repo.login === 'function') {
                listener(IStateListener_1.PROCESS_STATES.REPOSITORY_LOGIN_STARTED);
                const isLoggedIn = yield repo.login(credentials);
                listener(IStateListener_1.PROCESS_STATES.REPOSITORY_LOGIN_FINISHED, { isLoggedIn: !!isLoggedIn });
            }
            if (typeof repo.publish !== 'function') {
                throw new Error(`Repository "${repository}" does not implement publish`);
            }
            const result = yield repo.publish(pkg, {
                listener
            });
            return result;
        });
    }
}
exports.default = PackageManager;
//# sourceMappingURL=PackageManager.js.map