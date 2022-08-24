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
const fs_1 = __importDefault(require("fs"));
const Mock_1 = __importDefault(require("../Repositories/test/Mock"));
const PackageUtils_1 = require("../utils/PackageUtils");
const Downloader_1 = require("../Downloader");
const IStateListener_1 = require("../IStateListener");
const semver_1 = __importDefault(require("semver"));
const FilenameUtils_1 = require("../utils/FilenameUtils");
const SpecParser_1 = __importDefault(require("../SpecParser"));
const RepositoryManager_1 = __importDefault(require("../Repositories/RepositoryManager"));
const FsRepo_1 = __importDefault(require("../Repositories/FsRepo"));
exports.instanceOfPackageQuery = (str) => typeof str === 'string' && str.includes(':') && !fs_1.default.existsSync(str);
function instanceofResolvePackageOptions(object) {
    return typeof object === 'object' && ('spec' in object);
}
exports.instanceofResolvePackageOptions = instanceofResolvePackageOptions;
const LOGLEVEL = {
    WARN: -1,
    NORMAL: 0,
    VERBOSE: 2
};
const createLogger = (_loglevel) => {
    return (loglevel = LOGLEVEL.NORMAL, message, ...optionalParams) => {
        if (_loglevel >= loglevel) {
            if (loglevel === LOGLEVEL.WARN) {
                console.log('WARNING:', message, optionalParams);
            }
            else {
                console.log(message, optionalParams);
            }
        }
    };
};
const log = createLogger(LOGLEVEL.NORMAL);
class Fetcher {
    constructor(repoManager) {
        this.name = 'Fetcher';
        this.repoManager = repoManager || new RepositoryManager_1.default();
    }
    /**
     *
     * @param spec : PackageQuery
     * @param options : FetchOptions
     */
    filterReleases(releases, { filter = undefined, filterInvalid = true, packagesOnly = true, sort = true, version = undefined, limit = 0, listener = () => { } } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // filter releases without fileName AND non-package releases e.g. Github assets that are .txt, .json etc unless packagesOnly de-activated
            releases = releases.map(release => {
                if (release.fileName && (packagesOnly === false || FilenameUtils_1.hasPackageExtension(release.fileName))) {
                    return release;
                }
                release.error = 'Release has no file name information or unsupported package extension';
                return release;
            });
            // filter invalid releases i.e. releases that have the error field set
            const invalid = releases.filter(release => ('error' in release && release.error));
            if (invalid.length > 0) {
                // log(LOGLEVEL.WARN, `detected ${invalid.length} corrupted releases`)
                // log(LOGLEVEL.VERBOSE, invalid.map(r => r.error).join('\n\n'))
                listener(IStateListener_1.PROCESS_STATES.FILTERED_INVALID_RELEASES, { invalid });
            }
            if (filterInvalid) {
                releases = releases.filter(release => !('error' in release && release.error));
            }
            // filter releases based on version or version range info or filename
            if (version) {
                // if version info is a specific filename
                if (FilenameUtils_1.hasPackageExtension(version)) {
                    const fileName = version;
                    const release = releases.find(r => r.fileName.toLowerCase() === fileName.toLowerCase());
                    releases = release ? [release] : [];
                }
                // else: semver logic
                else {
                    // TODO move filter in utils
                    releases = releases.filter(release => {
                        if (!('version' in release)) {
                            return false;
                        }
                        const release_version = release.version;
                        return semver_1.default.satisfies(release_version, version);
                    });
                }
            }
            // apply client-defined filter function
            if (filter && typeof filter === 'function') {
                releases = releases.filter(filter);
            }
            // sort releases by semver and date, and return them descending (latest first)
            // do not consider prerelease info (alphabetically) if it is e.g. commit hash
            if (sort) {
                listener(IStateListener_1.PROCESS_STATES.SORT_RELEASES_STARTED);
                releases = releases.sort(PackageUtils_1.multiSort(PackageUtils_1.compareVersions, PackageUtils_1.compareDate));
                listener(IStateListener_1.PROCESS_STATES.SORT_RELEASES_FINISHED);
                // releases =  releases.sort(compareVersions)
            }
            // only return "limit"-number of entries
            if (limit) {
                const l = releases.length;
                releases = releases.slice(0, limit < l ? limit : l);
            }
            return releases;
        });
    }
    listReleases(spec, { filter = undefined, filterInvalid = true, packagesOnly = true, sort = true, version = undefined, prefix = undefined, timeout = 0, cache = undefined, skipCache = false, cacheOnly = false, preferCache = true, 
    // TODO cacheThreshold = 24 * 60,
    pagination = false, limit = 0, listener = () => { } } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!spec || !exports.instanceOfPackageQuery(spec)) {
                throw new Error(`Package query is undefined or malformed: "${spec}"`);
            }
            spec = spec.trim();
            let repository = undefined;
            let parsedSpec = undefined;
            if (spec.startsWith('mock')) {
                const testCase = spec.split(':')[1];
                repository = new Mock_1.default(testCase);
            }
            else {
                parsedSpec = yield SpecParser_1.default.parseSpec(spec);
                if (!parsedSpec)
                    throw new Error(`Unsupported or invalid package specification: "${spec}"`);
                version = parsedSpec.version || version;
            }
            const filterArgs = {
                filter,
                filterInvalid,
                packagesOnly,
                sort,
                version,
                limit,
                listener
            };
            // before we make a long running call to backend (which requires internet) test the cache
            let cachedReleases = [];
            if (cache !== undefined) {
                if (cache instanceof Array) {
                    // TODO handle cache arrays
                    cache = cache[0];
                }
                try {
                    const _cache = new FsRepo_1.default({
                        project: cache
                    });
                    cachedReleases = yield _cache.listReleases();
                    if (cachedReleases.length > 0 && preferCache) {
                        let filteredReleases = yield this.filterReleases(cachedReleases, filterArgs);
                        const latestCached = filteredReleases.length > 0 ? filteredReleases[0] : undefined;
                        if (latestCached && latestCached.updated_ts) {
                            const diffMinutes = ((Date.now() - latestCached.updated_ts) / 1000) / 60;
                            if (diffMinutes < (24 * 60)) {
                                return filteredReleases;
                            }
                        }
                    }
                }
                catch (error) {
                    // console.log('cache error', error)
                }
            }
            repository = parsedSpec && (yield this.repoManager.getRepository(parsedSpec));
            if (!repository) {
                throw new Error('Could not find a repository for specification: ' + spec);
            }
            let releases = [];
            if (cacheOnly) {
                releases = cachedReleases;
            }
            else {
                listener(IStateListener_1.PROCESS_STATES.FETCHING_RELEASE_LIST_STARTED, { repo: repository.name });
                try {
                    releases = yield repository.listReleases({
                        prefix,
                        pagination,
                        timeout
                    });
                }
                catch (error) {
                    // TODO logger
                    console.log('Repository exception: could not retrieve release list', error && error.message);
                    releases = cachedReleases;
                }
                listener(IStateListener_1.PROCESS_STATES.FETCHING_RELEASE_LIST_FINISHED, { releases, repo: repository.name });
            }
            listener(IStateListener_1.PROCESS_STATES.FILTER_RELEASE_LIST_STARTED);
            let filteredReleases = yield this.filterReleases(releases, filterArgs);
            listener(IStateListener_1.PROCESS_STATES.FILTER_RELEASE_LIST_FINISHED, { releases: filteredReleases });
            return filteredReleases;
        });
    }
    getRelease(spec, { listener = () => { }, filter = undefined, version = undefined, platform = process.platform, // FIXME this info is only implemented via filters
    prefix = undefined, timeout = 0, skipCache = false, cache = undefined, pagination = false, limit = 0 } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            spec = spec.trim();
            // notify client about process start
            listener(IStateListener_1.PROCESS_STATES.RESOLVE_PACKAGE_STARTED, { platform, version });
            const releases = yield this.listReleases(spec, {
                filter,
                filterInvalid: true,
                sort: true,
                version,
                prefix,
                timeout,
                cache,
                skipCache,
                pagination,
                limit: 5000,
                listener
            });
            let resolved = undefined;
            // if more than one release is returned we default to returning the latest version
            if (!resolved && releases.length > 0) {
                // handle the common case of remote and local (cached)
                // having same version. in this case we want to always return cached
                if (releases.length > 1) {
                    if (releases[0].version === releases[1].version) {
                        if (releases[0].remote && !releases[1].remote) {
                            resolved = releases[1];
                        }
                    }
                }
                resolved = releases[0];
            }
            if (!resolved) {
                // FIXME failed
                listener(IStateListener_1.PROCESS_STATES.RESOLVE_PACKAGE_FINISHED, { release: resolved, platform, version });
                return undefined;
            }
            // notify client about process end
            listener(IStateListener_1.PROCESS_STATES.RESOLVE_PACKAGE_FINISHED, { release: resolved, platform, version });
            // if package not from cache / fs repo it is always remote
            // this info is quite critical as it is used e.g. by updaters to determine
            // if the latest version was fetched from remote or was available locally
            // TODO implement cache
            resolved.remote = true;
            return resolved;
        });
    }
    downloadPackage(release, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let { listener, proxy, onDownloadProgress } = options;
            const stateListener = listener || (() => { });
            // wrap onProgress
            // TODO protect with try catch
            let progress = 0;
            const _onProgress = (p) => {
                const progressNew = Math.floor(p * 100);
                if (progressNew > progress) {
                    progress = progressNew;
                    // console.log(`downloading update..  ${pn}%`)
                    stateListener(IStateListener_1.PROCESS_STATES.DOWNLOAD_PROGRESS, { progress, release, size: release.size });
                    if (typeof onDownloadProgress === 'function') {
                        onDownloadProgress(progress, release);
                    }
                }
            };
            // download release data / asset
            let { location } = release;
            if (!location)
                throw new Error('package location not found');
            stateListener(IStateListener_1.PROCESS_STATES.DOWNLOAD_STARTED, { location, release });
            // TODO if proxy is used issue warning
            if (proxy && proxy.endsWith('/')) {
                proxy = proxy.slice(0, -1);
            }
            location = proxy ? `${proxy}/${encodeURI(location)}` : location;
            const packageData = yield Downloader_1.download(location, _onProgress, 0, {
                parallel: 0,
                headers: options.headers
            });
            stateListener(IStateListener_1.PROCESS_STATES.DOWNLOAD_FINISHED, { location, size: packageData.length, release });
            return packageData;
        });
    }
}
exports.default = Fetcher;
//# sourceMappingURL=Fetcher.js.map