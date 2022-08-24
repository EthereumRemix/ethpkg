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
const jszip_1 = __importDefault(require("jszip"));
const util_1 = require("../util");
const IStateListener_1 = require("../IStateListener");
class ZipPackage {
    constructor(packagePathOrName) {
        this.type = 'zip';
        this.fileName = '<unknown>';
        this._size = 0;
        this.filePath = packagePathOrName || '';
        if (this.filePath) {
            this.fileName = path_1.default.basename(this.filePath);
        }
    }
    init() {
        this.zip = new jszip_1.default();
        return this;
    }
    get size() {
        return this._size;
    }
    tryLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.zip && this.filePath) {
                const buf = fs_1.default.readFileSync(this.filePath);
                yield this.loadBuffer(buf);
            }
        });
    }
    loadBuffer(buf) {
        return __awaiter(this, void 0, void 0, function* () {
            this._size = buf.byteLength;
            this.zip = yield jszip_1.default.loadAsync(buf);
            return this;
        });
    }
    getEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.tryLoad();
            if (!this.zip) {
                throw new Error('package not loaded - load with loadBuffer()');
            }
            // get entries
            let entries = [];
            this.zip.forEach((relativePath, file /**ZipObject */) => {
                const { name, size, unixPermissions: mode, dir: isDir, _data } = file;
                const { uncompressedSize } = _data;
                let iFile = {
                    name: path_1.default.basename(name),
                    size: uncompressedSize,
                    mode,
                    isDir,
                    readContent: (t = 'nodebuffer') => __awaiter(this, void 0, void 0, function* () {
                        return file.async(t);
                    })
                };
                entries.push({
                    relativePath,
                    file: iFile
                });
            });
            return entries;
        });
    }
    // TODO can be performance optimized
    getEntry(relativePath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.tryLoad();
            if (!this.zip) {
                throw new Error('package not loaded - load with loadBuffer()');
            }
            try {
                let entries = yield this.getEntries();
                let entry = entries.find((entry) => ['', '/', './'].some(prefix => `${prefix}${entry.relativePath.replace(/^\.\/+/g, '')}` === relativePath));
                return entry || undefined;
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
            yield this.tryLoad();
            if (!this.zip) {
                throw new Error('package not loaded - load with loadBuffer()');
            }
            const content = Buffer.isBuffer(file) ? file : (typeof file === 'string' ? Buffer.from(file) : yield file.readContent());
            // FIXME does not handle overwrite
            this._size += content.byteLength;
            this.zip.file(relativePath, content);
            return relativePath;
        });
    }
    toBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.tryLoad();
            if (!this.zip) {
                throw new Error('package not loaded - load with loadBuffer()');
            }
            let buf = yield this.zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
            return buf;
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
    extract(destPath, { listener = undefined } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return util_1.extractPackage(this, destPath, listener);
        });
    }
    writePackage(outPath, { overwrite = false, compression = true } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.default.existsSync(outPath) && !overwrite) {
                throw new Error('Package exists already! Use "overwrite" option');
            }
            yield this.tryLoad();
            if (!this.zip) {
                throw new Error('package not loaded - load with loadBuffer()');
            }
            let options = { type: 'nodebuffer', compression: 'DEFLATE' };
            if (!compression) {
                delete options.compression;
            }
            const content = yield this.zip.generateAsync(options);
            fs_1.default.writeFileSync(outPath, content);
            return outPath;
        });
    }
    static create(dirPathOrName, { listener = () => { } } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const dirPath = path_1.default.basename(dirPathOrName) === dirPathOrName ? undefined : dirPathOrName;
            const packageName = dirPath ? path_1.default.basename(dirPathOrName) : dirPathOrName;
            const pkg = new ZipPackage(packageName).init();
            const writeFileToPackage = (fullPath) => __awaiter(this, void 0, void 0, function* () {
                const relativePath = path_1.default.relative(dirPath, fullPath);
                listener(IStateListener_1.PROCESS_STATES.CREATE_PACKAGE_PROGRESS, {
                    file: relativePath
                });
                yield pkg.addEntry(relativePath, util_1.localFileToIFile(fullPath));
            });
            const writeDirToPackage = (dirPath) => __awaiter(this, void 0, void 0, function* () {
                // console.log('write dir', dirPath)
                const fileNames = fs_1.default.readdirSync(dirPath);
                for (const fileName of fileNames) {
                    const fullPath = path_1.default.join(dirPath, fileName);
                    if (util_1.isDirSync(fullPath)) {
                        yield writeDirToPackage(fullPath);
                    }
                    else if (util_1.isFileSync(fullPath)) {
                        yield writeFileToPackage(fullPath);
                    }
                    // else ignore symlinks etc
                }
            });
            if (dirPath) {
                yield writeDirToPackage(dirPath);
            }
            return pkg;
        });
    }
    static from(packagePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const buf = fs_1.default.readFileSync(packagePath);
            return new ZipPackage(packagePath).loadBuffer(buf);
        });
    }
}
exports.default = ZipPackage;
//# sourceMappingURL=ZipPackage.js.map