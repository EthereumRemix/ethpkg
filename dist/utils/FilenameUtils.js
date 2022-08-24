"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
// the supported package extensions
const PACKAGE_EXTENSIONS = ['.zip', '.tar.gz', '.tgz', '.tar'];
// this helper is especially used to support .tar.gz
exports.getExtension = (fileName) => {
    for (let i = 0; i < PACKAGE_EXTENSIONS.length; i++) {
        const ext = PACKAGE_EXTENSIONS[i];
        if (fileName.endsWith(ext)) {
            return ext;
        }
    }
    let ext = path_1.default.extname(fileName);
    return ext.length > 2 ? ext : '';
};
exports.hasPackageExtension = (fileName) => {
    if (!fileName)
        return false;
    fileName = fileName.trim();
    const ext = exports.getExtension(fileName);
    return PACKAGE_EXTENSIONS.includes(ext);
};
exports.hasSignatureExtension = (fileName) => {
    if (fileName === undefined)
        return false;
    const ext = exports.getExtension(fileName);
    return ext === '.asc';
};
exports.removeExtension = (fileName) => {
    const ext = exports.getExtension(fileName);
    return ext.length > 0 ? fileName.slice(0, -ext.length) : fileName;
};
//# sourceMappingURL=FilenameUtils.js.map