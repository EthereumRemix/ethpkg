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
class File {
    constructor(options) {
        this.name = options.name;
        this.type = 'application/gzip';
        this.lastModified = Date.now();
        this.buffer = options.buffer;
        this.size = this.buffer.byteLength;
    }
}
/**
 * https://github.com/ipfs/go-ipfs/issues/6523
 */
class IpfsRepository {
    constructor({ owner = '', project = '' } = {}) {
        this.name = 'IpfsRepository';
        this.owner = owner;
        this.repo = project;
        this.toRelease = this.toRelease.bind(this);
    }
    get api() {
        return 'https://ipfs.infura.io:5001/api/v0';
    }
    toRelease(releaseInfo) {
        const releases = [];
        return releases;
    }
    listReleases(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const dirHash = ''; // TODO use service to keep track of dir
            const endpoint = `${this.api}/dag/get?arg=${dirHash}`;
            const packageInfo = yield Downloader_1.download(endpoint);
            const pkgInfo = JSON.parse(packageInfo.toString());
            // console.log('package info', pkgInfo)
            return pkgInfo.links.map((info) => {
                const release = {
                    fileName: info.Name
                };
            });
        });
    }
    publish(pkg, {} = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const dirHash = ''; // TODO use service to keep track of dir
            const endpoint = `${this.api}/add?pin=false`;
            // const endpoint = 'https://ipfs.infura.io:5001/api/v0/add?pin=false&wrap-with-directory=true'
            // FIXME make File object
            const data = yield pkg.toBuffer();
            const file = new File({
                name: pkg.fileName,
                // type: "text/plain",     // optional
                buffer: data
            });
            const response = yield Downloader_1.request('POST', endpoint, {
                'Content-Type': 'multipart/form-data',
                Body: data,
                fileName: pkg.fileName
            });
            // console.log('response', response.statusCode)
            const resp = yield Downloader_1.downloadStreamToBuffer(response);
            // response is line-delimited json stream (see json stream)
            const responses = resp.toString().split('\n').filter((l) => !!l).map((l) => JSON.parse(l));
            // console.log('raw response', responses)
            return {
                fileName: pkg.fileName,
                original: responses
            };
        });
    }
}
exports.default = IpfsRepository;
//# sourceMappingURL=Ipfs.js.map