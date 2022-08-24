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
const path_1 = __importDefault(require("path"));
const semver_1 = __importDefault(require("semver"));
const FilenameHeuristics_1 = require("./FilenameHeuristics");
const REALEASE_CHANNEL = {
    dev: -1,
    ci: -1,
    alpha: 0,
    beta: 1,
    nightly: 2,
    production: 3,
    master: 4,
    release: 4,
};
exports.compareVersions = (a, b) => {
    if (!('version' in a) || !a.version)
        return -1;
    if (!('version' in b) || !b.version)
        return 1;
    // don't let semver apply its "channel logic": 
    // coerce to apply custom channel logic on same versions (same before "-channel")
    let av = semver_1.default.coerce(a.version);
    let bv = semver_1.default.coerce(b.version);
    // @ts-ignore
    const semComp = semver_1.default.compare(bv, av);
    // try to set the channel based on version if it was not
    // explicitly set by repository (which is a good style)
    a.channel = a.channel || FilenameHeuristics_1.extractChannelFromVersionString(a.version);
    b.channel = b.channel || FilenameHeuristics_1.extractChannelFromVersionString(b.version);
    if (semComp === 0) {
        const channelA = REALEASE_CHANNEL[a.channel || ''] || -2;
        const channelB = REALEASE_CHANNEL[b.channel || ''] || -2;
        if (channelA > channelB)
            return -1;
        if (channelB > channelA)
            return 1;
        return 0;
    }
    return semComp;
};
exports.compareDate = ({ updated_ts: a }, { updated_ts: b }) => {
    if (a && b)
        return a > b ? -1 : (b > a ? 1 : 0);
    if (a)
        return -1;
    if (b)
        return 1;
    return 0;
};
exports.multiSort = (fn1, fn2) => {
    return (a, b) => {
        const res1 = fn1(a, b);
        const res2 = fn2(a, b);
        return res1 + res2;
    };
};
exports.datestring = (d) => {
    if (typeof d === 'number') {
        d = new Date(d);
    }
    return d.toISOString()
        .replace(/T/, ' ') // replace T with a space
        .replace(/\..+/, ''); // delete the dot and everything after
};
/**
 * there ar emultiple ways how files are addressed inside packages
 * some tools and modules create absolute paths, some prefix with ./ or omit
 * therefore we need to compare all possible options to test for "equality"
 */
exports.relativePathEquals = (path1, path2) => {
    return ['', '/', './'].some(prefix => `${prefix}${path1.replace(/^\.\/+/g, '')}` === path2);
};
exports.normalizeRelativePath = (s) => {
    if (!s.startsWith('./')) {
        return `./${s}`;
    }
    return s;
};
exports.toIFile = (relPath, content) => {
    const contentBuf = (typeof content === 'string') ? Buffer.from(content) : content;
    const name = path_1.default.basename(relPath);
    return {
        name,
        isDir: false,
        size: contentBuf.byteLength,
        readContent: () => Promise.resolve(contentBuf)
    };
};
exports.toFile = exports.toIFile;
// TODO consider moving to package utils
exports.writeEntry = (pkg, relPath, content) => __awaiter(void 0, void 0, void 0, function* () {
    const entry = exports.toIFile(relPath, content);
    yield pkg.addEntry(relPath, entry);
});
//# sourceMappingURL=PackageUtils.js.map