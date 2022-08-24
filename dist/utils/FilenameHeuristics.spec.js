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
const FilenameHeuristics = __importStar(require("./FilenameHeuristics"));
describe('FilenameHeuristics', () => {
    describe('extractVersionFromString = (str : string | undefined) :string | undefined', () => {
        const testCases = [
            { fileName: 'foo.bla.tar.gz', expected: undefined },
            { fileName: 'foo-1.0.0-bar.tar', expected: '1.0.0' },
            { fileName: 'foo_1.0.0_bar', expected: '1.0.0' },
            { fileName: 'geth-darwin-amd64-1.9.5-a1c09b93.tar.gz', expected: '1.9.5' },
            { fileName: 'geth-darwin-amd64-1.9.9-01744997.tar.gz', expected: '1.9.9' },
            { fileName: 'validator-v1.0.0-alpha.8-darwin-amd64', expected: '1.0.0-alpha.8' },
            { fileName: 'validator-v1.0.0-alpha.alpha.8-darwin-amd64', expected: '1.0.0-alpha' },
            { fileName: 'validator-v1.0.0-hello.world', expected: '1.0.0' },
            { fileName: 'validator-v1.0.0-alpha.82foo-darwin-amd64', expected: '1.0.0-alpha.82' },
            { fileName: 'validator-v1.0.0-alpha.8-darwin-amd64', expected: '1.0.0-alpha.8' },
            { fileName: 'v1.2-hello', expected: undefined },
        ];
        for (const testCase of testCases) {
            const { fileName, expected } = testCase;
            it(`extracts the version info from ${fileName} -> ${expected}`, () => __awaiter(void 0, void 0, void 0, function* () {
                const result = FilenameHeuristics.extractVersionFromString(fileName);
                chai_1.assert.equal(result, expected);
            }));
        }
    });
});
//# sourceMappingURL=FilenameHeuristics.spec.js.map