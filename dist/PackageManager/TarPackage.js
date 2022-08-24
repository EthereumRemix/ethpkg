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
const zlib_1 = __importDefault(require("zlib"));
const tar_stream_1 = __importDefault(require("tar-stream"));
const util_1 = require("../util");
const FilenameUtils_1 = require("../utils/FilenameUtils");
const PackageUtils_1 = require("../utils/PackageUtils");
const IStateListener_1 = require("../IStateListener");
class TarPackage {
    constructor(packagePathOrName, compressed = true) {
        this.fileName = '<unknown>';
        this.filePath = packagePathOrName || '';
        if (this.filePath) {
            this.fileName = path_1.default.basename(this.filePath);
        }
        this.isGzipped = this.filePath ? ['.tgz', '.tar.gz'].includes(FilenameUtils_1.getExtension(this.filePath)) : compressed;
    }
    get size() {
        return this.tarbuf ? this.tarbuf.byteLength : 0;
    }
    init() { }
    loadBuffer(buf) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tarbuf = buf;
            return this;
        });
    }
    getReadStream() {
        if (this.tarbuf) {
            return util_1.bufferToStream(this.tarbuf);
        }
        else {
            return fs_1.default.createReadStream(this.filePath, { highWaterMark: Math.pow(2, 16) });
        }
    }
    processTar(iterator, append) {
        return __awaiter(this, void 0, void 0, function* () {
            // create read stream of current archive
            const inputStream = this.getReadStream();
            // this is used to transform the input stream into an extracted stream
            const extract = tar_stream_1.default.extract();
            // create pack stream for new archive
            const pack = tar_stream_1.default.pack(); // pack is a streams2 stream
            // first scan the package and check if the entry exists
            // if it exists overwrite it
            extract.on('entry', function (header, stream, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    // header is the tar header
                    // stream is the content body (might be an empty stream)
                    // call next when you are done with this entry
                    const result = yield iterator(header, stream, pack);
                    // the iterator signals with a truthy value that a modification on the entry stream happened
                    // and the passed stream was already processed --> resume()
                    if (result) {
                        next();
                        stream.resume();
                    }
                    else {
                        // write the unmodified entry to the pack stream
                        stream.pipe(pack.entry(header, next));
                    }
                });
            });
            // if file was not replaced add it as new entry here (before finalize):
            extract.on('finish', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // allow the iterator to append new entries to pack stream here:
                    if (typeof append === 'function') {
                        yield append(pack);
                    }
                    pack.finalize();
                });
            });
            // start the process by piping the input stream in the transformer (extract)
            if (this.isGzipped) {
                inputStream.pipe(zlib_1.default.createGunzip()).pipe(extract);
            }
            else {
                inputStream.pipe(extract);
            }
            // FIXME make write stream otional: seek operations do not need it and it costs perf
            // write new tar to buffer (this consumes the input stream)
            let strm = this.isGzipped ? pack.pipe(zlib_1.default.createGzip()) : pack;
            return util_1.streamToBuffer(strm);
        });
    }
    getEntryData(relPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.processTar((header, stream) => __awaiter(this, void 0, void 0, function* () {
                    const { name: relativePath } = header;
                    if (relativePath === relPath) {
                        const data = yield util_1.streamToBuffer(stream);
                        resolve(data);
                        // FIXME stop processing / iteration here
                        return 1;
                    }
                    else {
                        return 0;
                    }
                }));
            }));
        });
    }
    getEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            const entries = [];
            yield this.processTar((header, stream) => {
                const { name: relativePath, size, type, mode } = header;
                const name = path_1.default.basename(relativePath);
                const iFile = {
                    name,
                    size,
                    mode,
                    isDir: type === 'directory',
                    readContent: (t = 'nodebuffer') => __awaiter(this, void 0, void 0, function* () { return this.getEntryData(relativePath); })
                };
                entries.push({
                    relativePath,
                    file: iFile
                });
            });
            return entries;
        });
    }
    getEntry(relativePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const entries = yield this.getEntries();
                // remove leading ./ from relative path and try different prefixes
                const entry = entries.find((entry) => PackageUtils_1.relativePathEquals(entry.relativePath, relativePath));
                return entry;
            }
            catch (error) {
                return undefined;
            }
        });
    }
    getContent(relativePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = yield this.getEntry(relativePath);
            // TODO standardize errors
            if (!entry)
                throw new Error('entry does not exist: ' + relativePath);
            if (entry.file.isDir)
                throw new Error('entry is not a file');
            return entry.file.readContent();
        });
    }
    addEntry(relativePath, file) {
        return __awaiter(this, void 0, void 0, function* () {
            let wasOverwritten = false;
            const writeEntryToPackStream = (pack, relativePath) => {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    const content = Buffer.isBuffer(file) ? file : (typeof file === 'string' ? Buffer.from(file) : yield file.readContent());
                    let entry = pack.entry({ name: relativePath }, content);
                    entry.on('finish', () => {
                        resolve();
                    });
                    entry.end();
                }));
            };
            this.tarbuf = yield this.processTar((header, stream, pack) => __awaiter(this, void 0, void 0, function* () {
                const { name: entryRelativePath } = header;
                // apparently a tar can contain multiple
                // files with the same name / relative path
                // in order to avoid duplicates we must overwrite existing entries
                if (PackageUtils_1.relativePathEquals(entryRelativePath, relativePath)) {
                    // overwrite entry in pack stream
                    yield writeEntryToPackStream(pack, entryRelativePath);
                    wasOverwritten = true;
                    return 1; // signal that entry was modified
                }
            }), (pack) => __awaiter(this, void 0, void 0, function* () {
                // no existing entry was overwritten so we append new entries to pack
                if (!wasOverwritten) {
                    yield writeEntryToPackStream(pack, relativePath);
                }
            }));
            return relativePath;
        });
    }
    toBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.tarbuf) {
                if (this.filePath) {
                    this.tarbuf = fs_1.default.readFileSync(this.filePath);
                }
                else {
                    throw new Error('Could not create package buffer');
                }
            }
            return Promise.resolve(this.tarbuf);
        });
    }
    // from ISerializable
    getObjectData() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                buffer: yield this.toBuffer(),
                metadata: this.metadata,
                filePath: this.filePath
            };
        });
    }
    writePackage(outPath, { overwrite = false, compression = true // TODO handle compression param
     } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (util_1.isDirPath(outPath)) {
                if (!this.fileName) {
                    throw new Error('Cannot write package: file name is not set and path points to directory');
                }
                // expand to file path
                outPath = path_1.default.join(outPath, this.fileName);
            }
            if (fs_1.default.existsSync(outPath) && !overwrite) {
                throw new Error('Package exists already! Use "overwrite" option');
            }
            if (this.isGzipped && (!(outPath.endsWith('.tgz') || outPath.endsWith('.tar.gz')))) {
                throw new Error('Attempt to write compressed data into a decompressed file: consider using ".tar.gz" or ".tgz" or explicitly decompress');
            }
            let s;
            if (!this.isGzipped && ((outPath.endsWith('.tgz') || outPath.endsWith('.tar.gz')))) {
                s = this.getReadStream().pipe(zlib_1.default.createGzip()).pipe(fs_1.default.createWriteStream(outPath));
            }
            else {
                s = this.getReadStream().pipe(fs_1.default.createWriteStream(outPath));
            }
            yield util_1.streamPromise(s);
            return outPath;
        });
    }
    extract(destPath, { listener = undefined } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return util_1.extractPackage(this, destPath, listener);
        });
    }
    printPackageInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const entries = yield this.getEntries();
            console.log(entries.map(e => e.relativePath).join('\n'));
        });
    }
    static create(dirPathOrName, { compressed = true, listener = () => { } } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // pack is a streams2 stream
            const pack = tar_stream_1.default.pack();
            const dirPath = path_1.default.basename(dirPathOrName) === dirPathOrName ? undefined : dirPathOrName;
            let packageName = dirPath ? path_1.default.basename(dirPathOrName) : dirPathOrName;
            if (!FilenameUtils_1.hasPackageExtension(packageName)) {
                packageName += (compressed ? '.tar.gz' : 'tar');
            }
            if (dirPath) {
                const writeFileToPackStream = (filePath) => {
                    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        const content = fs_1.default.readFileSync(filePath);
                        const relativePath = path_1.default.relative(dirPath, filePath);
                        let entry = pack.entry({ name: relativePath }, content);
                        listener(IStateListener_1.PROCESS_STATES.CREATE_PACKAGE_PROGRESS, {
                            file: relativePath
                        });
                        entry.on('finish', () => {
                            resolve();
                        });
                        entry.end();
                    }));
                };
                // FIXME might exceed callstack - implement upper limits and remove recursion
                const writeDirToPackStream = (dirPath) => __awaiter(this, void 0, void 0, function* () {
                    // console.log('write dir', dirPath)
                    const fileNames = fs_1.default.readdirSync(dirPath);
                    for (const fileName of fileNames) {
                        // TODO implement listener
                        const fullPath = path_1.default.join(dirPath, fileName);
                        if (util_1.isDirSync(fullPath)) {
                            yield writeDirToPackStream(fullPath);
                        }
                        else if (util_1.isFileSync(fullPath)) {
                            yield writeFileToPackStream(fullPath);
                        }
                        // else ignore symlinks etc
                    }
                });
                yield writeDirToPackStream(dirPath);
            }
            else {
                // an empty package is created: use package name as hint if it is compressed or not
                const extension = FilenameUtils_1.getExtension(packageName);
                if (extension === '.tar') {
                    compressed = false;
                }
            }
            let strm = compressed ? pack.pipe(zlib_1.default.createGzip()) : pack;
            pack.finalize();
            const packageBuffer = yield util_1.streamToBuffer(strm);
            const t = new TarPackage(packageName, false);
            yield t.loadBuffer(packageBuffer);
            return t;
        });
    }
    static from(packagePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const buf = fs_1.default.readFileSync(packagePath);
            return new TarPackage(packagePath).loadBuffer(buf);
        });
    }
}
exports.default = TarPackage;
//# sourceMappingURL=TarPackage.js.map