"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const ZipPackage_1 = __importDefault(require("./ZipPackage"));
const TarPackage_1 = __importDefault(require("./TarPackage"));
const file_type_1 = __importDefault(require("file-type"));
// @ts-ignore
const excludedFiles = e => !/\.zip$/.test(e);
class pkg {
    static isPackage() {
        return true;
    }
}
pkg.create = (pkgDirPath, pkgOutPath) => __awaiter(this, void 0, void 0, function* () {
    if (!fs_1.lstatSync(pkgDirPath).isDirectory()) {
        throw new Error('package source is not a directory');
    }
    const addFile = (src, f, pkg) => {
        pkg.addEntry(f, fs_1.default.readFileSync(path_1.default.join(src, f)));
    };
    // FIXME determine the package type e.g zip / tar based on out path
    const zip = new ZipPackage_1.default();
    zip.init(); // create new empty package
    const files = fs_1.default
        .readdirSync(pkgDirPath)
        .filter(excludedFiles)
        .forEach(f => addFile(pkgDirPath, f, zip));
    if (pkgOutPath) {
        zip.writePackage(pkgOutPath);
    }
    return zip;
});
pkg.getPackage = (pkgSrc) => __awaiter(this, void 0, void 0, function* () {
    if (typeof pkgSrc === 'string') {
        if (!fs_1.default.existsSync(pkgSrc)) {
            throw new Error('package not found');
        }
        if (!fs_1.lstatSync(pkgSrc).isFile()) {
            throw new Error('package source is not a file');
        }
        if (pkgSrc.endsWith('.tgz') || pkgSrc.endsWith('.tar.gz')) {
            const tar = new TarPackage_1.default(pkgSrc);
            return tar;
        }
        else if (pkgSrc.endsWith('.zip')) {
            const zip = new ZipPackage_1.default();
            const pgkContent = fs_1.default.readFileSync(pkgSrc);
            yield zip.loadBuffer(pgkContent);
            return zip;
        }
        else {
            let ext = path_1.default.extname(pkgSrc);
            throw new Error('unsupported package type: ' + ext);
        }
    }
    else if (Buffer.isBuffer(pkgSrc)) {
        const bufferType = file_type_1.default(pkgSrc);
        if (!bufferType) {
            throw new Error('bad input buffer');
        }
        if (bufferType.mime === 'application/gzip') {
            const tar = new TarPackage_1.default();
            yield tar.loadBuffer(pkgSrc);
            return tar;
        }
        else if (bufferType.mime === 'application/zip') {
            const zip = new ZipPackage_1.default();
            yield zip.loadBuffer(pkgSrc);
            return zip;
        }
        else {
            throw new Error('unsupported input buffer' + bufferType.mime);
        }
    }
    else {
        throw new Error('unsupported input type for package');
    }
});
exports.pkg = pkg;
//# sourceMappingURL=pkg.js.map