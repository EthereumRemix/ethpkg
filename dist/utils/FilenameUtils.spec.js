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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const FilenameUtils = __importStar(require("./FilenameUtils"));
describe('FilenameUtils', () => {
    describe('getExtension = (fileName : string) : string ', () => {
        const testCases = [
            { fileName: 'foo.tar', expected: '.tar' },
            { fileName: 'foo.zip', expected: '.zip' },
            { fileName: 'foo.bla.tar.gz', expected: '.tar.gz' },
            { fileName: 'foo.bla.tar.tgz', expected: '.tgz' },
            { fileName: 'foo.bla.tar.gz.asc', expected: '.asc' }
        ];
        for (const testCase of testCases) {
            const { fileName, expected } = testCase;
            it(`extracts the file extension from "${fileName}" -> ${expected}`, () => __awaiter(void 0, void 0, void 0, function* () {
                const result = FilenameUtils.getExtension(fileName);
                chai_1.assert.equal(result, expected);
            }));
        }
    });
    describe('hasPackageExtension = (fileName : string | undefined) : boolean', () => {
        const testCases = [
            { fileName: 'foo.jpg', expected: false },
            { fileName: 'foo.zip', expected: true },
            { fileName: 'foo.bla.tar.gz', expected: true },
            { fileName: 'foo.bla.tar.tgz', expected: true },
            { fileName: 'tar.gz', expected: false },
            { fileName: '', expected: false },
            { fileName: '.tar.gz', expected: true },
            { fileName: '.tar.gz.asc', expected: false },
            { fileName: '.zip.asc', expected: false },
            { fileName: '', expected: false },
            { fileName: undefined, expected: false },
            { fileName: 'geth-alltools-linux-amd64-1.9.11-unstable-38d1b0cb.tar.gz ', expected: true },
            { fileName: 'hello-world@1.0.0 ', expected: false }
        ];
        for (const testCase of testCases) {
            const { fileName, expected } = testCase;
            it(`checks if file "${fileName}" has a package extension -> ${expected}`, () => __awaiter(void 0, void 0, void 0, function* () {
                const result = FilenameUtils.hasPackageExtension(fileName);
                chai_1.assert.equal(result, expected);
            }));
        }
    });
    describe('hasSignatureExtension = (fileName : string | undefined) : boolean', () => {
        const testCases = [
            { fileName: 'asc.tar.gz', expected: false },
            { fileName: '.tar.asc.gz', expected: false },
            { fileName: '.zip.asc', expected: true },
            { fileName: '', expected: false },
            { fileName: undefined, expected: false }
        ];
        for (const testCase of testCases) {
            const { fileName, expected } = testCase;
            it(`checks if file "${fileName}" has a signature-file extension -> ${expected}`, () => __awaiter(void 0, void 0, void 0, function* () {
                const result = FilenameUtils.hasSignatureExtension(fileName);
                chai_1.assert.equal(result, expected);
            }));
        }
    });
    describe('removeExtension = (fileName : string) : string', () => {
        const testCases = [
            { fileName: 'foo.tar.gz', expected: 'foo' },
            { fileName: 'bar.zip', expected: 'bar' },
            { fileName: 'foo.tar.gz.asc', expected: 'foo.tar.gz' }
        ];
        for (const testCase of testCases) {
            const { fileName, expected } = testCase;
            it(`removes the file extension from "${fileName}" -> ${expected}`, () => __awaiter(void 0, void 0, void 0, function* () {
                const result = FilenameUtils.removeExtension(fileName);
                chai_1.assert.equal(result, expected);
            }));
        }
    });
});
//# sourceMappingURL=FilenameUtils.spec.js.map