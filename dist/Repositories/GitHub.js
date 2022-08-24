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
const rest_1 = require("@octokit/rest");
const FilenameHeuristics_1 = require("../utils/FilenameHeuristics");
const PackageUtils_1 = require("../utils/PackageUtils");
class GitHubRepository {
    constructor({ owner = '', project = '', auth = undefined }) {
        this.name = 'GitHubRepository';
        // WARNING: For unauthenticated requests, the rate limit allows for up to 60 requests per hour.
        if (process.env.GITHUB_TOKEN && typeof process.env.GITHUB_TOKEN === 'string') {
            // TODO make sure it works in browser
            this.client = new rest_1.Octokit({
                // @ts-ignore
                auth: process.env.GITHUB_TOKEN
            });
        }
        else {
            this.client = new rest_1.Octokit({
                auth
            });
        }
        this.owner = owner;
        this.repo = project;
        this.toRelease = this.toRelease.bind(this);
    }
    _toRelease(name, tag_name, assetName, size, updated_at, browser_download_url, original) {
        const version = FilenameHeuristics_1.extractVersionFromString(tag_name);
        const displayVersion = FilenameHeuristics_1.versionToDisplayVersion(version);
        const channel = FilenameHeuristics_1.extractChannelFromVersionString(version);
        const updated_ts = Date.parse(updated_at); // return timestamp
        return {
            name: `${this.owner}_${this.repo}`,
            version,
            displayVersion,
            channel,
            fileName: assetName,
            size,
            updated_ts,
            updated_at: PackageUtils_1.datestring(updated_ts),
            location: browser_download_url,
            original
        };
    }
    toRelease(releaseInfo /*ReposListReleasesResponseItem*/) {
        const { 
        /*
        url,
        assets_url,
        html_url,
        upload_url,
        tarball_url,
        zipball_url,
        id,
        node_id,
        tag_name,
        target_commitish,
        name,
        body,
        draft,
        prerelease,
        created_at,
        published_at,
        author,
        */
        assets, name: releaseName, tag_name, target_commitish: branch } = releaseInfo;
        let releases = assets.map((asset /*ReposListReleasesResponseItemAssetsItem*/) => {
            const { browser_download_url, content_type, created_at, download_count, id, label, name: assetName, node_id, size, state, updated_at, 
            // uploader,
            url, } = asset;
            let releaseInfoCopy = JSON.parse(JSON.stringify(releaseInfo));
            delete releaseInfoCopy.assets;
            const original = {
                releaseInfo: releaseInfoCopy,
                asset
            };
            return this._toRelease(releaseName, tag_name, assetName, size, updated_at, browser_download_url, original);
        });
        return releases;
    }
    listReleases(options) {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME use pagination
            try {
                let releaseInfo = yield this.client.repos.listReleases({
                    owner: this.owner,
                    repo: this.repo,
                });
                // convert to IRelease list and flatten
                let releases = releaseInfo.data.map(this.toRelease).reduce((prev, cur) => {
                    return prev.concat(cur);
                });
                // console.log('latest releases unsorted\n', releases.map(r => `{ version: '${r.version}', channel: '${r.channel}' }`).slice(0, 5).join(',\n'))
                return releases;
            }
            catch (error) {
                throw new Error('Could not retrieve release list from GitHub: ' + (error ? error.message : ''));
                throw error;
            }
        });
    }
    publish(pkg, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const version = pkg.metadata ? pkg.metadata.version : FilenameHeuristics_1.extractVersionFromString(pkg.fileName) || Date.now();
            const { data: releaseDraft } = yield this.client.repos.createRelease({
                owner: this.owner,
                repo: this.repo,
                tag_name: 'v' + version,
                name: `${pkg.fileName} - ${version}`,
                draft: false,
                body: 'ethpkg auto-generated release'
            });
            if (!releaseDraft) {
                throw new Error('Release draft failed');
            }
            const fileName = pkg.fileName;
            const contentType = fileName.endsWith('.txt') ? 'text/plain' : 'application/octet-stream';
            const contentLength = pkg.size;
            const githubOpts = {
                owner: this.owner,
                repo: this.repo,
                release_id: releaseDraft.id,
                url: releaseDraft.upload_url,
                headers: {
                    'content-type': contentType,
                    'content-length': contentLength,
                },
                name: fileName,
                data: yield pkg.toBuffer()
            };
            // @ts-ignore see: https://github.com/octokit/rest.js/issues/1645
            const { data: assetResponse } = yield this.client.repos.uploadReleaseAsset(githubOpts);
            if (!assetResponse) {
                throw new Error('Asset upload failed');
            }
            const { tag_name } = releaseDraft;
            const { name: assetName, size, updated_at, browser_download_url } = assetResponse;
            const original = {
                releaseDraft,
                assetResponse
            };
            const release = this._toRelease(assetName, tag_name, assetName, size, updated_at, browser_download_url, original);
            return release;
        });
    }
}
exports.default = GitHubRepository;
//# sourceMappingURL=GitHub.js.map