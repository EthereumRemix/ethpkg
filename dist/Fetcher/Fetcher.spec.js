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
const chai_1 = require("chai");
const _1 = __importDefault(require("."));
describe('Fetcher', () => {
    describe.skip('async listReleases(spec: PackageQuery, options: FetchOptions): Promise<IRelease[]>', function () {
        this.timeout(60 * 1000);
        // FIXME http responses need to be mocked
        const repoQueries = [
            { query: 'github:ethereum/grid-ui', expected: 30 },
            { query: 'npm:philipplgh/ethpkg', expected: 18 },
            { query: 'npm:ethpkg', expected: 3 },
            // TODO without releases info part we probably have to assume that client wants whatever is in master
            { query: 'github:ethereum/remix-ide', expected: 14 },
            { query: 'azure:gethstore', expected: 2500 }
        ];
        for (const testCase of repoQueries) {
            const { query, expected } = testCase;
            it.skip(`lists releases for PackageQuery: "${query}"`, () => __awaiter(this, void 0, void 0, function* () {
                const fetcher = new _1.default();
                const result = yield fetcher.listReleases(query);
                chai_1.assert.equal(result.length, expected);
            }));
        }
        const repoUrls = [
            { url: 'https://gethstore.blob.core.windows.net', expected: 2500 }
        ];
        for (const testCase of repoUrls) {
            const { url: repoUrl, expected } = testCase;
            it.skip(`lists releases for repository URL: ${repoUrl}`, () => __awaiter(this, void 0, void 0, function* () {
                const fetcher = new _1.default();
                const result = yield fetcher.listReleases(repoUrl);
                chai_1.assert.equal(result.length, expected);
            }));
        }
        it(`can filter invalid releases`, () => __awaiter(this, void 0, void 0, function* () {
            const fetcher = new _1.default();
            const spec = 'mock:invalid';
            const result = yield fetcher.listReleases(spec);
            const names = result.map(r => r.name).join(',');
            chai_1.assert.equal('valid release', names);
        }));
        it(`can return invalid releases e.g. for debugging`, () => __awaiter(this, void 0, void 0, function* () {
            const fetcher = new _1.default();
            const spec = 'mock:invalid';
            const result = yield fetcher.listReleases(spec, {
                filterInvalid: false
            });
            chai_1.assert.equal(2, result.length);
        }));
        it.skip(`can filter releases by semver version`, () => __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(false, true);
        }));
        it.skip(`can filter releases by semver version ranges`, () => __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(false, true);
        }));
        it(`can sort releases using semver and return them descending (latest first)`, () => __awaiter(this, void 0, void 0, function* () {
            const fetcher = new _1.default();
            const spec = 'mock:unsorted';
            const result = yield fetcher.listReleases(spec);
            const versions = result.map(r => r.version).join(',');
            const expected = '3.0.0,2.0.0,1.1.1-alpha,1.0.2-alpha,1.0.1-beta,1.0.1-alpha,1.0.1-foo,1.0.0,0.1.1';
            chai_1.assert.equal(versions, expected);
        }));
    });
    describe('async getRelease(spec: PackageQuery, options: ResolvePackageOptions = {}) : Promise<IRelease | undefined>', function () {
        this.timeout(60 * 1000);
        it('fetches the release info based on a query and additional filter options', () => __awaiter(this, void 0, void 0, function* () {
        }));
        it.skip('handles queries with filenames', () => __awaiter(this, void 0, void 0, function* () {
            const query = 'azure:gethstore@geth-alltools-linux-amd64-1.9.11-unstable-38d1b0cb.tar.gz ';
            const fetcher = new _1.default();
            const result = yield fetcher.getRelease(query);
            chai_1.assert.isDefined(result);
        }));
    });
    describe('async downloadPackage(locator : PackageLocator, listener : StateListener = () => {}) : Promise<Buffer>', () => {
        it('download a package based on a url and provides progress updates', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
    });
});
//# sourceMappingURL=Fetcher.spec.js.map