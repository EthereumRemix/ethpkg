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
const PackageUtils_1 = require("../utils/PackageUtils");
const FilenameUtils_1 = require("../utils/FilenameUtils");
class BintrayRepository {
    constructor({ owner, project }) {
        this.name = 'BintrayRepository';
        this.owner = owner;
        const parts = project.split('/');
        this.repo = parts[0];
        this.package = parts[1];
        this.toRelease = this.toRelease.bind(this);
    }
    toRelease(pkgInfo) {
        const { name: nameOrg, // 'pantheon-0.8.2.tar.gz'
        path, // 'pantheon-0.8.2.tar.gz.asc'
        // repo, // pegasys-repo
        // package, // pantheon
        version, 
        // owner, // consensys
        created, size, sha1, sha256 } = pkgInfo;
        const name = FilenameUtils_1.removeExtension(nameOrg);
        const displayName = name;
        const fileName = nameOrg;
        const commit = undefined;
        const updated_ts = Date.parse(created);
        const channel = undefined;
        const location = `https://bintray.com/${this.owner}/${this.repo}/download_file?file_path=${fileName}`;
        return {
            name,
            version,
            displayVersion: version,
            channel,
            fileName,
            updated_ts,
            updated_at: PackageUtils_1.datestring(updated_ts),
            size,
            location,
            error: undefined,
            original: pkgInfo,
            remote: true
        };
    }
    listReleases(options) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://bintray.com/docs/api/#_get_package_files does not seem to have prefix option
            const infoUrl = `https://api.bintray.com/packages/${this.owner}/${this.repo}/${this.package}/files`;
            const packageInfo = yield Downloader_1.downloadJson(infoUrl);
            let releases = packageInfo
                .map(this.toRelease);
            // map signatures to releases
            //TODO releases = releases.filter((r : IRelease) => !r.fileName.endsWith('.asc'))
            return releases;
        });
    }
}
exports.default = BintrayRepository;
//# sourceMappingURL=Bintray.js.map