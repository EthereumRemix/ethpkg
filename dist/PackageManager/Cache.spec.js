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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chai_1 = require("chai");
const Cache_1 = require("./Cache");
const util_1 = require("../util");
const TarPackage_1 = __importDefault(require("./TarPackage"));
const ZipPackage_1 = __importDefault(require("./ZipPackage"));
const PackageUtils_1 = require("../utils/PackageUtils");
class Dummy {
    constructor(info) {
        if (typeof info === 'string') {
            this.data = info;
        }
        else {
            this.data = info.data;
        }
    }
    static getConstructor() {
        return (info) => __awaiter(this, void 0, void 0, function* () { return new Dummy(info); });
    }
    getObjectData() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.data;
        });
    }
}
const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
const CACHE_PATH = path_1.default.join(FIXTURES, 'TestCache');
describe('Cache', () => {
    describe('withCache', () => {
        /**
         * this is a good example that shows how dangerous caching can be if state is changed as side effect
         * or if the state changes in the meantime and we have different expectations
         * => use caching wisely
         */
        it('takes a function that returns something serializable (implements ISerializable) and a cache to memoize or persist the responses', () => __awaiter(void 0, void 0, void 0, function* () {
            let i = 0;
            const cacheableFn = (arg) => __awaiter(void 0, void 0, void 0, function* () { return new Dummy(arg + (++i)); });
            const cache = new Cache_1.MemCache(); // effectively creates memoization and does not need a factory function because objects are never serialized
            const cachedFn = Cache_1.withCache(cache, cacheableFn);
            const res1 = yield cachedFn('hello'); // i = 1 this result will be cached and ALWAYS returned!!
            const res2 = yield cachedFn('hello'); // NOTE: this will not call the original function -> i = 1
            const res3 = yield cacheableFn('hello'); // i = 2
            const res4 = yield cacheableFn('hello'); // i = 3
            const res5 = yield cachedFn('hello'); // i = 1
            chai_1.assert.equal(res1, res2);
            chai_1.assert.equal(res2.data, 'hello1');
            chai_1.assert.equal(res3.data, 'hello2');
            chai_1.assert.equal(res4.data, 'hello3');
            chai_1.assert.equal(res5.data, 'hello1');
        }));
    });
    describe.skip('PersistentJsonCache', () => {
        before('setting up temp cache dirs', () => {
            if (!fs_1.default.existsSync(CACHE_PATH)) {
                fs_1.default.mkdirSync(CACHE_PATH);
            }
            const files = fs_1.default.readdirSync(CACHE_PATH);
            chai_1.assert.isEmpty(files, 'test cache should not contain any items');
        });
        // preconditions
        it.skip('WARNING: json.parse does NOT handle buffers', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = 'foo';
            const buf = Buffer.from(data);
            const serializeMe = {
                buffer: buf,
                name: 'bar'
            };
            const serialized = JSON.stringify(serializeMe);
            const recoveredObj = JSON.parse(serialized);
            chai_1.assert.notEqual(serializeMe.buffer.toString(), recoveredObj.buffer.toString());
        }));
        it.skip('json.parse accepts a reviver function to recover nested buffers', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = 'foo';
            const buf = Buffer.from(data);
            const serializeMe = {
                buffer: buf,
                name: 'bar'
            };
            const serialized = JSON.stringify(serializeMe);
            const recoveredObj = JSON.parse(serialized, (key, value) => {
                if (value.type && value.type === 'Buffer') {
                    return Buffer.from(value.data);
                }
                return value;
            });
            chai_1.assert.equal(serializeMe.buffer.toString(), recoveredObj.buffer.toString());
        }));
        // tests:
        it('persists and restores objects that implement the ISerializable interface', () => __awaiter(void 0, void 0, void 0, function* () {
            const KEY = 'OBJ_KEY';
            const DATA = 'foo bar';
            const cache = new Cache_1.PersistentJsonCache(CACHE_PATH, Dummy.getConstructor());
            yield cache.put(KEY, new Dummy(DATA));
            const obj = yield cache.get(KEY);
            chai_1.assert.equal(obj.data, DATA);
        }));
        it('persists and restores tar/IPackage objects', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = yield TarPackage_1.default.create('NewPackage.tar');
            const relPath = './hello.txt';
            const KEY = 'pkg';
            yield pkg.addEntry(relPath, PackageUtils_1.toIFile(relPath, 'world'));
            const ctor = (info) => {
                const { ctor, data } = info;
                const { filePath, buffer } = data;
                return new TarPackage_1.default(filePath).loadBuffer(buffer);
            };
            const cache = new Cache_1.PersistentJsonCache(CACHE_PATH, ctor);
            yield cache.put(KEY, pkg);
            const restored = yield cache.get(KEY);
            const entry = yield restored.getContent(relPath);
            chai_1.assert.equal(entry.toString(), 'world');
        }));
        it('persists and restores zip/IPackage objects', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = yield ZipPackage_1.default.create('NewPackage.zip');
            const relPath = './hello.txt';
            const KEY = 'pkg'; // note: this will overwrite the tar from previous test
            yield pkg.addEntry(relPath, PackageUtils_1.toIFile(relPath, 'world2'));
            const ctor = (info) => {
                const { ctor, data } = info;
                const { filePath, buffer } = data;
                return new ZipPackage_1.default(filePath).loadBuffer(buffer);
            };
            const cache = new Cache_1.PersistentJsonCache(CACHE_PATH, ctor);
            yield cache.put(KEY, pkg);
            const restored = yield cache.get(KEY);
            const entry = yield restored.getContent(relPath);
            chai_1.assert.equal(entry.toString(), 'world2');
        }));
        it('persists and restores IRelease objects', () => __awaiter(void 0, void 0, void 0, function* () {
            const KEY = '123456789';
            const release = {
                fileName: 'hello',
                version: '1.0.0',
                channel: 'beta',
                size: 2000000000,
                original: {
                    foo: 'bar'
                }
            };
            const ctor = (info) => info.data;
            const cache = new Cache_1.PersistentJsonCache(CACHE_PATH, ctor);
            yield cache.put(KEY, release);
            const restored = yield cache.get(KEY);
            chai_1.assert.deepEqual(restored, release);
        }));
        it('returns undefined for keys that don\'t exist in the cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const ctor = (info) => {
                const { ctor, data } = info;
                const { filePath, buffer } = data;
                return new TarPackage_1.default(filePath).loadBuffer(buffer);
            };
            const cache = new Cache_1.PersistentJsonCache(CACHE_PATH, ctor);
            const obj = yield cache.get('12345');
            chai_1.assert.isUndefined(obj);
        }));
        after('remove temp cache dirs', () => {
            // node 12: fs.rmdir(CACHE_PATH, { recursive: true });
            util_1.deleteFolderRecursive(CACHE_PATH);
        });
    });
});
//# sourceMappingURL=Cache.spec.js.map