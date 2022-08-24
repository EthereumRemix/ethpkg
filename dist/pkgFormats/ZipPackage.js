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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const jszip_1 = __importDefault(require("jszip"));
class ZipPackage {
    constructor() {
    }
    init() {
        this.zip = new jszip_1.default();
    }
    loadBuffer(buf) {
        return __awaiter(this, void 0, void 0, function* () {
            this.zip = yield jszip_1.default.loadAsync(buf);
        });
    }
    getEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.zip) {
                throw new Error('package not loaded - load with loadBuffer()');
            }
            // get entries
            let entries = [];
            this.zip.forEach((relativePath, file /**ZipObject */) => {
                let iFile = {
                    isDir: file.dir,
                    name: path_1.default.basename(file.name),
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
            if (!this.zip) {
                throw new Error('package not loaded - load with loadBuffer()');
            }
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
    addEntry(relativePath, content) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.zip) {
                throw new Error('package not loaded - load with loadBuffer()');
            }
            this.zip.file(relativePath, content);
            return relativePath;
        });
    }
    toBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.zip) {
                throw new Error('package not loaded - load with loadBuffer()');
            }
            let buf = yield this.zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
            return buf;
        });
    }
    writePackage(filePath, useCompression = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.zip) {
                throw new Error('package not loaded - load with loadBuffer()');
            }
            let options = { type: "nodebuffer", compression: "DEFLATE" };
            if (!useCompression) {
                delete options.compression;
            }
            const content = yield this.zip.generateAsync(options);
            fs_1.default.writeFileSync(filePath, content);
            return filePath;
        });
    }
}
exports.default = ZipPackage;
//# sourceMappingURL=ZipPackage.js.map