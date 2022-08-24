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
const PackageUtils = __importStar(require("./PackageUtils"));
const testData = [
    {
        'name': 'a',
        'fileName': 'a.tar',
        'version': '3.0.0'
    },
    {
        'name': 'b',
        'fileName': 'b.tar',
        'version': '2.0.0'
    },
    {
        'name': 'c',
        'fileName': 'c.tar',
        'version': '1.0.0'
    },
    {
        'name': 'd2',
        'fileName': 'd2.tar',
        'version': '1.0.1-alpha'
    },
    {
        'name': 'd3',
        'fileName': 'd3.tar',
        'version': '1.0.1-foo'
    },
    {
        'name': 'd',
        'fileName': 'd.tar',
        'version': '1.0.1-beta'
    },
    {
        'name': 'e',
        'fileName': 'e.tar',
        'version': '1.1.1-alpha'
    },
    {
        'name': 'f',
        'fileName': 'f.tar',
        'version': '1.0.2-alpha'
    },
    {
        'name': 'g',
        'fileName': 'g.tar',
        'version': '0.1.1'
    }
];
const SORTED_VERSIONS = '3.0.0,2.0.0,1.1.1-alpha,1.0.2-alpha,1.0.1-beta,1.0.1-alpha,1.0.1-foo,1.0.0,0.1.1';
describe('PackageUtils', () => {
    describe('compareVersions = (a : {version?:string, channel?: string}, b : {version?:string, channel?: string})', () => {
        it('compares two release infos and sorts them by version', () => __awaiter(void 0, void 0, void 0, function* () {
            const a = {
                version: '1.0.0'
            };
            const b = {
                version: '1.0.1'
            };
            const result = PackageUtils.compareVersions(a, b);
            chai_1.assert.equal(result, 1);
        }));
        it('sorts an array of IRelease by version when passed to sort()', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = testData.sort(PackageUtils.compareVersions);
            const versions = result.map(r => r.version).join(',');
            chai_1.assert.equal(versions, SORTED_VERSIONS);
        }));
    });
    describe('compareDate = ({updated_ts: a} : {updated_ts?:number}, {updated_ts: b} : {updated_ts?:number})', () => {
        it('compares two timestamps and sorts them by "youngest first"', () => __awaiter(void 0, void 0, void 0, function* () {
            const a = {
                updated_ts: Date.now()
            };
            const b = {
                updated_ts: Date.now() + 10 // + = older
            };
            const result = PackageUtils.compareDate(a, b);
            chai_1.assert.equal(result, 1);
        }));
        it('ignores invalid attribute values', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = PackageUtils.compareDate({}, {});
            chai_1.assert.equal(result, 0);
        }));
    });
    describe('multiSort = (fn1: Function, fn2: Function)', () => {
        it.skip('combines two sort function into one', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = testData.sort(PackageUtils.multiSort(PackageUtils.compareVersions, PackageUtils.compareDate));
            const versions = result.map(r => r.version).join(',');
            chai_1.assert.equal(versions, SORTED_VERSIONS);
        }));
        it('maintains order if only one sort function is used (only one attribute present)', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = testData.sort(PackageUtils.multiSort(PackageUtils.compareVersions, PackageUtils.compareDate));
            const versions = result.map(r => r.version).join(',');
            const result2 = testData.sort(PackageUtils.compareVersions);
            const versions2 = result2.map(r => r.version).join(',');
            chai_1.assert.equal(versions, versions2);
        }));
    });
    describe('datestring = (d : Date | number) : string', () => {
        it('formats a unix timestamp into a formatted date string to display', () => __awaiter(void 0, void 0, void 0, function* () {
            const ts = 1576430493177;
            const str = PackageUtils.datestring(ts);
            chai_1.assert.equal(str, '2019-12-15 17:21:33');
        }));
    });
});
//# sourceMappingURL=PackageUtils.spec.js.map