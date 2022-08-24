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
const crypto_1 = __importDefault(require("crypto"));
const ISerializable_1 = require("./ISerializable");
exports.md5 = (data) => crypto_1.default.createHash('md5').update(data).digest('hex');
class ICache {
}
exports.ICache = ICache;
function instanceOfICache(obj) {
    return obj && typeof obj.put === 'function' && typeof obj.get === 'function' && typeof obj.has === 'function';
}
exports.instanceOfICache = instanceOfICache;
// TODO specify return value
// TODO test with multiple args
function withCache(cache, fn, keyFn) {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        // if function to generate key is provided use it otherwise try to hash args
        // FIXME handle functions such as listener by removing them from key
        const key = keyFn ? keyFn(...args) : exports.md5(JSON.stringify(args));
        if (yield cache.has(key)) {
            // TODO based on hit/miss we can extend the cache lifetime here or load to mem
            try {
                return cache.get(key);
            }
            catch (error) {
                // ignore errors during restore and just fallback to fetch + overwrite
            }
        }
        const result = yield fn(...args);
        yield cache.put(key, result);
        return result;
    });
}
exports.withCache = withCache;
class MemCache extends ICache {
    constructor() {
        super();
        this.cache = {};
    }
    put(key, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache[key] = obj;
            return key;
        });
    }
    keys() {
        return Object.keys(this.cache);
    }
    has(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return key in this.cache;
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cache[key];
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache = {};
        });
    }
}
exports.MemCache = MemCache;
// TODO consider using a compressed tar package as cache
// export class PackagedCache extends ICache
// TODO find solution for browser caching
// TODO consider using cacache
// TODO consider using cbor as serialization
// TODO consider using LRU cache
class PersistentJsonCache extends ICache {
    constructor(dirPath, ctor) {
        super();
        this.dirPath = dirPath;
        this.ctor = ctor;
    }
    keyToFilepath(key) {
        const name = `${exports.md5(key)}.json`;
        const fullPath = path_1.default.join(this.dirPath, name);
        return fullPath;
    }
    put(key, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullPath = this.keyToFilepath(key);
            const data = ISerializable_1.isSerializable(obj) ? (yield obj.getObjectData()) : obj;
            const serializationInfo = {
                data,
                ctor: obj === undefined ? undefined : obj.constructor.name,
                ts: Date.now()
            };
            const dataHash = exports.md5(JSON.stringify(serializationInfo));
            yield fs_1.promises.writeFile(fullPath, JSON.stringify(serializationInfo));
            return dataHash;
        });
    }
    has(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullPath = this.keyToFilepath(key);
            return fs_1.default.existsSync(fullPath);
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.has(key);
            if (!exists) {
                return undefined;
            }
            const fullPath = this.keyToFilepath(key);
            // console.log('load from cache', fullPath)
            try {
                const result = yield fs_1.promises.readFile(fullPath);
                // json.parse does not handle nested buffers: see Cache.test
                const data = JSON.parse(result.toString(), (key, value) => {
                    if (value && value.type && value.type === 'Buffer') {
                        return Buffer.from(value.data);
                    }
                    return value;
                });
                return this.ctor(data);
            }
            catch (error) {
                // console.log('cache error:', error)
                throw new Error('de-serialization error: ' + error.message);
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield fs_1.promises.readdir(this.dirPath);
            for (const file of files) {
                // TODO this will also effect json files that are not under the cache's control. an index would avoid this
                if (file.endsWith('.json')) {
                    yield fs_1.promises.unlink(path_1.default.resolve(this.dirPath, file));
                }
            }
        });
    }
}
exports.PersistentJsonCache = PersistentJsonCache;
class NoCache extends ICache {
    put(key, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            return key;
        });
    }
    has(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return undefined;
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            // nothing to do
        });
    }
}
exports.NoCache = NoCache;
//# sourceMappingURL=Cache.js.map