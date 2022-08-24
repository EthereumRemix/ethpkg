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
const IPackage_1 = require("./IPackage");
const FilenameUtils_1 = require("../utils/FilenameUtils");
const BrowserUtils_1 = require("../utils/BrowserUtils");
const util_1 = require("../util");
// TODO redundant impl. move to utils
const isFilePath = (pkgPath) => {
    try {
        return fs_1.lstatSync(pkgPath).isFile();
    }
    catch (error) {
        return false;
    }
};
function instanceOfPackageData(obj) {
    return IPackage_1.instanceofIPackage(obj) || Buffer.isBuffer(obj) || (typeof obj === 'string' && isFilePath(obj)) || (util_1.is.browser() && File && obj instanceof File);
}
exports.instanceOfPackageData = instanceOfPackageData;
const getPackageFromBuffer = (pkgBuf, pkgFileName) => __awaiter(void 0, void 0, void 0, function* () {
    const bufferType = file_type_1.default(pkgBuf);
    if (!bufferType) {
        throw new Error('bad input buffer');
    }
    // https://en.wikipedia.org/wiki/List_of_archive_formats
    if (['application/gzip'].includes(bufferType.mime)) {
        // FIXME throw if pkgFileName is not provided
        // FIXME tar packages need a more robust way to determine if gzipped. to use names is especially bad because of cases like this
        const tar = new TarPackage_1.default(pkgFileName || 'package-from-buffer.tar.gz');
        yield tar.loadBuffer(pkgBuf);
        return tar;
    }
    else if (['application/x-tar'].includes(bufferType.mime)) {
        const tar = new TarPackage_1.default(pkgFileName || 'package-from-buffer.tar');
        yield tar.loadBuffer(pkgBuf);
        return tar;
    }
    else if (bufferType.mime === 'application/zip') {
        const zip = new ZipPackage_1.default(pkgFileName || 'package-from-buffer.zip');
        yield zip.loadBuffer(pkgBuf);
        return zip;
    }
    else {
        throw new Error('unsupported input buffer: ' + bufferType.mime);
    }
});
exports.getPackageFromFile = (pkgSrc) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_1.default.existsSync(pkgSrc)) {
        throw new Error('package not found');
    }
    if (pkgSrc.endsWith('.tar') || pkgSrc.endsWith('.tgz') || pkgSrc.endsWith('.tar.gz')) {
        const tar = new TarPackage_1.default(pkgSrc);
        return tar;
    }
    else if (pkgSrc.endsWith('.zip')) {
        const zip = new ZipPackage_1.default(pkgSrc);
        const pgkContent = fs_1.default.readFileSync(pkgSrc);
        yield zip.loadBuffer(pgkContent);
        return zip;
    }
    else {
        let ext = path_1.default.extname(pkgSrc);
        throw new Error('unsupported package type: ' + ext);
    }
});
exports.toPackage = (pkgSpec, release) => __awaiter(void 0, void 0, void 0, function* () {
    if (IPackage_1.instanceofIPackage(pkgSpec)) {
        return pkgSpec;
    }
    else if (Buffer.isBuffer(pkgSpec)) {
        const pkg = yield getPackageFromBuffer(pkgSpec, release ? release.fileName : undefined);
        pkg.metadata = release;
        if (!pkg) {
            throw new Error('Package buffer could not be loaded');
        }
        return pkg;
    }
    else if (typeof pkgSpec === 'string') {
        if (!fs_1.default.existsSync(pkgSpec)) {
            throw new Error('Package file not found at path: ' + pkgSpec);
        }
        if (yield isFilePath(pkgSpec)) {
            return exports.getPackageFromFile(pkgSpec);
        }
    }
    // browser support:
    else if (util_1.is.browser() && pkgSpec instanceof File && FilenameUtils_1.hasPackageExtension(pkgSpec.name)) {
        const fileBuffer = yield BrowserUtils_1.readFileToBuffer(pkgSpec);
        return getPackageFromBuffer(fileBuffer);
    }
    throw new Error('Package could not be loaded:' + JSON.stringify(pkgSpec));
});
//# sourceMappingURL=PackageService.js.map