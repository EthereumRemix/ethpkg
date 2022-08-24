"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
const util_1 = require("../util");
const tar = require('tar-stream');
class TarPackage {
    constructor(packagePath, compressed = true) {
        this.packagePath = packagePath || '';
        this.isGzipped = compressed;
    }
    loadBuffer(buf) {
        this.tarbuf = buf;
        return Promise.resolve();
    }
    getReadStream() {
        if (this.tarbuf) {
            return util_1.bufferToStream(this.tarbuf);
        }
        else {
            return fs_1.default.createReadStream(this.packagePath, { highWaterMark: Math.pow(2, 16) });
        }
    }
    getEntryData(entryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const inputStream = this.getReadStream();
            const extract = tar.extract();
            return new Promise((resolve, reject) => {
                extract.on('entry', (header, stream, next) => __awaiter(this, void 0, void 0, function* () {
                    let { name } = header;
                    const { size, type } = header;
                    const relPath = name;
                    name = path_1.default.basename(relPath);
                    if (relPath === entryPath) {
                        let fileData = yield util_1.streamToBuffer(stream, size);
                        resolve(fileData);
                        // TODO close here
                        next();
                    }
                    else {
                        stream.on('end', function () {
                            next(); // ready for next entry
                        });
                        stream.resume();
                    }
                }));
                extract.on('finish', () => {
                    // resolve(entries)
                });
                if (this.isGzipped) {
                    inputStream.pipe(zlib_1.default.createGunzip()).pipe(extract);
                }
                else {
                    inputStream.pipe(extract);
                }
            });
        });
    }
    getEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            const inputStream = this.getReadStream();
            const extract = tar.extract();
            return new Promise((resolve, reject) => {
                const entries = [];
                extract.on('entry', (header, stream, next) => {
                    let { name } = header;
                    const { size, type } = header;
                    const relativePath = name;
                    name = path_1.default.basename(relativePath);
                    let iFile = {
                        isDir: type === 'directory',
                        name,
                        readContent: (t = 'nodebuffer') => __awaiter(this, void 0, void 0, function* () {
                            const content = yield this.getEntryData(relativePath);
                            return content;
                        })
                    };
                    entries.push({
                        relativePath,
                        file: iFile
                    });
                    stream.on('end', function () {
                        next(); // ready for next entry
                    });
                    stream.resume();
                });
                extract.on('finish', () => {
                    resolve(entries);
                });
                // extract file and
                if (this.isGzipped) {
                    inputStream.pipe(zlib_1.default.createGunzip()).pipe(extract);
                }
                else {
                    inputStream.pipe(extract);
                }
            });
        });
    }
    getEntry(relativePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let entries = yield this.getEntries();
                let entry = entries.find((entry) => entry.relativePath === relativePath);
                return entry || null;
            }
            catch (error) {
                return null;
            }
        });
    }
    // TODO very poor performance - this can probably be optimized a LOT :(
    addEntry(relativePath, content) {
        return __awaiter(this, void 0, void 0, function* () {
            // prepare in / out streams
            let inputStream;
            // if tarbuf exists use instead of org file or it would overwite intermediate changes
            inputStream = this.getReadStream();
            // 
            const pack = tar.pack(); // pack is a streams2 stream
            const extract = tar.extract();
            // prepare compression
            const gzip = zlib_1.default.createGzip();
            let wasOverwritten = false;
            extract.on('entry', (header, stream, next) => {
                let { name } = header;
                const { size, type } = header;
                // apparently a tar can contain multiple
                // files with the same name / relative path
                // in order to avoid duplicates we must overwrite existing entries
                if (name === relativePath) {
                    wasOverwritten = true;
                    let entry = pack.entry({ name }, content);
                    entry.end();
                    stream.on('end', function () {
                        console.log('end');
                        next(); // ready for next entry
                    });
                    stream.resume(); // just auto drain the stream
                }
                else {
                    // write the unmodified entry to the pack stream
                    stream.pipe(pack.entry(header, next));
                }
            });
            extract.on('finish', function () {
                // add new entries here:
                if (!wasOverwritten) {
                    let entry = pack.entry({ name: relativePath }, content);
                    // all entries done - lets finalize it
                    entry.on('finish', () => {
                        pack.finalize();
                    });
                    entry.end();
                }
                else {
                    pack.finalize();
                }
            });
            // read input
            if (this.isGzipped) {
                inputStream.pipe(zlib_1.default.createGunzip()).pipe(extract);
            }
            else {
                inputStream.pipe(extract);
            }
            // write new tar to buffer
            let strm = pack.pipe(gzip);
            // @ts-ignore
            this.tarbuf = yield util_1.streamToBuffer(strm);
            return relativePath;
        });
    }
    toBuffer() {
        throw new Error("Method not implemented.");
    }
    writePackage(outPath) {
        if (!this.tarbuf) {
            throw new Error("cannot create tar file - empty buffer");
        }
        fs_1.default.writeFileSync(outPath, this.tarbuf);
        return Promise.resolve(outPath);
    }
}
exports.default = TarPackage;
//# sourceMappingURL=TarPackage.js.map