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
const SpecParser_1 = __importDefault(require("./SpecParser"));
const chai_1 = require("chai");
describe('SpecParser', () => {
    const queries = [
        {
            input: 'github:ethereum/remix-ide',
            expected: {
                name: 'github',
                project: 'remix-ide'
            }
        },
        {
            input: 'azure:gethstore',
            expected: {
                name: 'azure',
                project: 'gethstore'
            }
        },
        {
            input: 'npm:philipplgh/ethpkg',
            expected: {
                name: 'npm',
                project: 'ethpkg'
            }
        },
        {
            input: 'npm:ethpkg',
            expected: {
                name: 'npm',
                project: 'ethpkg'
            }
        },
        {
            input: 'bintray:hyperledger-org/besu-repo/besu',
            expected: {
                name: 'bintray',
                project: 'besu-repo/besu'
            }
        },
        {
            input: 'azure:gethstore@geth-alltools-darwin-amd64-1.9.8-unstable-22e3bbbf.tar.gz',
            expected: {
                name: 'azure',
                project: 'gethstore'
            }
        }
    ];
    const versionedSpecs = [
        'azure:gethstore@<=1.5.0',
    ];
    const fullUrls = [
        { input: 'https://gethstore.blob.core.windows.net', expected: {
                name: 'windows',
                project: 'gethstore'
            } },
        { input: 'https://www.github.com/PhilippLgh/ethpkg', expected: {
                name: 'github',
                owner: 'PhilippLgh',
                project: 'ethpkg'
            } },
        { input: 'https://github.com/ethereum/grid-ui', expected: {
                name: 'github',
                owner: 'ethereum',
                project: 'grid-ui'
            } }
    ];
    describe('static async parseSpec(spec: string) : Promise<ParsedSpec>', () => {
        for (const spec of queries) {
            const { input, expected } = spec;
            it(`parses query: "${input}"`, () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield SpecParser_1.default.parseSpec(input);
                chai_1.assert.isDefined(result);
                chai_1.assert.equal(result.name, expected.name);
                chai_1.assert.equal(result.project, expected.project);
            }));
        }
        for (const spec of versionedSpecs) {
            it(`parses query+version: "${spec}"`, () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield SpecParser_1.default.parseSpec(spec);
                chai_1.assert.isDefined(result);
                chai_1.assert.isDefined(result.name);
                chai_1.assert.isDefined(result.project);
                chai_1.assert.isDefined(result.version);
            }));
        }
        for (const testCase of fullUrls) {
            const { input, expected } = testCase;
            it(`parses full url: "${input}"`, () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield SpecParser_1.default.parseSpec(input);
                chai_1.assert.isDefined(result);
                for (const k in expected) {
                    chai_1.assert.equal(result[k], expected[k], `parsed result should have ${k}`);
                }
            }));
        }
    });
});
//# sourceMappingURL=SpecParser.spec.js.map