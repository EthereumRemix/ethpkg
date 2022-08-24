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
class NpmRepository {
    constructor({ owner, project }) {
        this.name = 'NpmRepository';
        // if owner / scope does not start with @ requests will fail
        if (owner && !owner.startsWith('@')) {
            owner = `@${owner}`;
        }
        this.owner = owner;
        this.project = project;
        this.toRelease = this.toRelease.bind(this);
    }
    toRelease(npmRelease /* package.json + extras */, time) {
        const { name, version, description, dist, _from } = npmRelease;
        const { integrity, shasum, tarball, fileCount, unpackedSize, 'npm-signature': signature } = dist;
        const fileName = tarball.split('/').pop();
        let updated_ts = undefined;
        let updated_at = undefined;
        if (version in time) {
            updated_ts = Date.parse(time[version]);
            updated_at = PackageUtils_1.datestring(updated_ts);
        }
        return {
            name,
            version,
            displayVersion: version,
            channel: undefined,
            fileName,
            updated_ts,
            updated_at,
            original: npmRelease,
            // error: undefined,
            location: tarball,
            remote: true
        };
    }
    listReleases(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const packageAuthor = this.owner;
            const packageName = this.project;
            const packageFullName = packageAuthor ? `${packageAuthor}/${packageName}` : packageName;
            const apiEndpoint = `https://registry.npmjs.org/${packageFullName}`;
            const parameterizedUrl = apiEndpoint;
            const result = yield Downloader_1.downloadJson(parameterizedUrl);
            const { versions, readme, license, bugs, author, maintainers, time } = result;
            let releases = Object.values(versions).map(v => this.toRelease(v, time));
            return releases;
        });
    }
}
exports.default = NpmRepository;
//# sourceMappingURL=Npm.js.map