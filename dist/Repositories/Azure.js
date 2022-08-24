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
Object.defineProperty(exports, "__esModule", { value: true });
const Downloader_1 = require("../Downloader");
const util_1 = require("../util");
const FilenameUtils_1 = require("../utils/FilenameUtils");
const FilenameHeuristics_1 = require("../utils/FilenameHeuristics");
const PackageUtils_1 = require("../utils/PackageUtils");
class AzureRepository {
    constructor({ project }) {
        this.name = 'AzureRepository';
        // https://docs.microsoft.com/en-us/rest/api/storageservices/list-blobs
        this.repositoryUrl = `https://${project}.blob.core.windows.net/builds?restype=container&comp=list`;
        this.toRelease = this.toRelease.bind(this);
    }
    toRelease(releaseInfo) {
        /* unhandled:
          'Content-Encoding': [ '' ],
          'Content-Language': [ '' ],
          'Cache-Control': [ '' ],
          'Content-Disposition': [ '' ],
          'BlobType': [ 'BlockBlob' ],
          'LeaseStatus': [ 'unlocked' ],
          'LeaseState': [ 'available' ]
        */
        const fileName = releaseInfo.Name[0];
        const name = FilenameUtils_1.removeExtension(fileName);
        const Properties = releaseInfo.Properties[0];
        const lastModified = Properties['Last-Modified'][0];
        const etag = Properties['Etag'][0];
        const size = Properties['Content-Length'][0];
        const contentType = Properties['Content-Type'][0];
        const md5 = Properties['Content-MD5'][0];
        const version = FilenameHeuristics_1.extractVersionFromString(name);
        const displayVersion = FilenameHeuristics_1.versionToDisplayVersion(version);
        const channel = FilenameHeuristics_1.extractChannelFromVersionString(displayVersion);
        // heuristics are not guaranteed to give accurate results:
        const platform = FilenameHeuristics_1.extractPlatformFromString(name);
        const arch = FilenameHeuristics_1.extractArchitectureFromString(name);
        let md5AtoB = Buffer.from(md5, 'base64').toString('binary');
        md5AtoB = md5AtoB.split('').map(char => ('0' + char.charCodeAt(0).toString(16)).slice(-2)).join('');
        // FIXME use url parser
        const baseUrl = this.repositoryUrl.split('?').shift();
        const location = `${baseUrl}/${fileName}`;
        const updated_ts = new Date(lastModified).getTime();
        let release = {
            name,
            fileName,
            version,
            displayVersion,
            updated_ts,
            updated_at: PackageUtils_1.datestring(updated_ts),
            platform,
            arch,
            tag: version,
            commit: undefined,
            size,
            channel,
            location: location,
            error: undefined,
            checksums: {
                md5: md5AtoB
            },
            remote: true
        };
        return release;
    }
    listReleases(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.time('download')
            let parameterizedUrl = this.repositoryUrl;
            if (options.prefix) {
                parameterizedUrl += `&prefix=${options.prefix}`;
            }
            const result = yield Downloader_1.download(parameterizedUrl);
            // console.timeEnd('download')
            // console.time('parse')
            let parsed;
            try {
                parsed = yield util_1.parseXml(result);
            }
            catch (error) {
                console.log('error: release feed could not be parsed: ', result);
                return [];
            }
            // console.timeEnd('parse') // 93.232ms
            // @ts-ignore
            const blobs = parsed.EnumerationResults.Blobs[0].Blob;
            if (!blobs) {
                return [];
            }
            // console.time('convert')
            let releases = blobs.map(this.toRelease);
            // console.timeEnd('convert') // 11.369ms
            // filter non-package assets and map signatures (.asc)
            let mapping = {};
            const packages = [];
            releases.forEach((release) => {
                const { fileName, version } = release;
                if (!fileName)
                    return; // ignore
                const isExtensionSupported = FilenameUtils_1.hasPackageExtension(fileName);
                if (isExtensionSupported && version) {
                    packages.push(release);
                }
                else if (FilenameUtils_1.hasSignatureExtension(fileName)) {
                    mapping[fileName] = release;
                }
                else {
                    // console.log('ignored', fileName)
                }
            });
            // 2nd iteration to apply mapping
            packages.forEach((release) => {
                // TODO move to utils? - hardcoded signature extension
                // construct lookup key
                const k = release.fileName + '.asc';
                if (mapping[k]) {
                    release.signature = mapping[k].location;
                }
            });
            return packages;
        });
    }
    static handlesSpec(spec) {
        return undefined;
    }
}
exports.default = AzureRepository;
//# sourceMappingURL=Azure.js.map