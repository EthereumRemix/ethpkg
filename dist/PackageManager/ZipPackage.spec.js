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
const ZipPackage_1 = __importDefault(require("./ZipPackage"));
const chai_1 = require("chai");
const util_1 = require("../util");
const PackageUtils_1 = require("../utils/PackageUtils");
describe('ZipPackage (IPackage)', () => {
    const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
    const FOO_PACKAGE = path_1.default.join(FIXTURES, 'foo.zip');
    const FOO_DIR = path_1.default.join(FIXTURES, 'foo');
    const FOO_NESTED_DIR = path_1.default.join(FIXTURES, 'foo_nested');
    const BAZ_TXT = path_1.default.join(FIXTURES, 'baz.txt');
    describe('loadBuffer(buf: Buffer): Promise<void> ', () => __awaiter(void 0, void 0, void 0, function* () {
        it('create an IPackage from tar buffer', () => __awaiter(void 0, void 0, void 0, function* () {
            const buf = fs_1.default.readFileSync(FOO_PACKAGE);
            const pkg = new ZipPackage_1.default(FOO_PACKAGE);
            yield pkg.loadBuffer(buf);
            const entries = yield pkg.getEntries();
            chai_1.assert.equal(entries.length, 3);
        }));
    }));
    describe('get size()', () => {
        it('returns the size of the package', () => __awaiter(void 0, void 0, void 0, function* () {
            // finder displays 536
            const buf = fs_1.default.readFileSync(FOO_PACKAGE); // 536 bytes
            const pkg = new ZipPackage_1.default(FOO_PACKAGE);
            yield pkg.loadBuffer(buf);
            // let _buf = await pkg.toBuffer() // 312 bytes
            const size = pkg.size;
            chai_1.assert.equal(size, 536);
        }));
    });
    describe('async getEntries(): Promise<IPackageEntry[]>', () => {
        it('returns all entries (files and dirs) from tar package', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = new ZipPackage_1.default(FOO_PACKAGE);
            const entries = yield pkg.getEntries();
            // ./foo/ & ./foo/foo.txt & ./foo/bar.txt
            chai_1.assert.equal(entries.length, 3);
        }));
    });
    describe('async getEntry(relativePath: string): Promise<IPackageEntry | undefined>', () => __awaiter(void 0, void 0, void 0, function* () {
        it('finds an entry by its relative path', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = new ZipPackage_1.default(FOO_PACKAGE);
            const entry = yield pkg.getEntry('/foo/bar.txt');
            chai_1.assert.isDefined(entry);
        }));
    }));
    describe('async getContent(relativePath: string): Promise<Buffer>', () => __awaiter(void 0, void 0, void 0, function* () {
        it('finds an entry by its relative path', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = new ZipPackage_1.default(FOO_PACKAGE);
            const content = yield pkg.getContent('foo/bar.txt');
            chai_1.assert.equal(content.toString(), 'bar');
        }));
    }));
    describe('addEntry(relativePath: string, file: IFile) : Promise<string>', () => __awaiter(void 0, void 0, void 0, function* () {
        it('adds a file to a newly created zip package', () => __awaiter(void 0, void 0, void 0, function* () {
            // NOTE: this will NOT work:
            // const pkg = await new TarPackage().loadBuffer(Buffer.from(''))
            const pkg = yield ZipPackage_1.default.create('my-package.zip');
            yield pkg.addEntry('baz.txt', PackageUtils_1.toIFile('baz.txt', 'baz'));
            const content = yield pkg.getContent('baz.txt');
            chai_1.assert.equal(content.toString(), 'baz');
        }));
        it.skip('adds a file to an existing <uncompressed> zip package', () => __awaiter(void 0, void 0, void 0, function* () {
            // needs fixture data
        }));
        it('adds a file to an existing <compressed> zip package', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = new ZipPackage_1.default(FOO_PACKAGE);
            const file = util_1.localFileToIFile(BAZ_TXT);
            yield pkg.addEntry('baz.txt', file);
            const content = yield pkg.getContent('baz.txt');
            chai_1.assert.equal(content.toString(), 'baz');
        }));
    }));
    describe('static async create(dirPath : string) : Promise<ZipPackage>', () => __awaiter(void 0, void 0, void 0, function* () {
        it('creates an empty tar if dirPathOrName argument is not a path', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = yield ZipPackage_1.default.create('my-package.zip');
            const entries = yield pkg.getEntries();
            chai_1.assert.equal(entries.length, 0);
        }));
        it('creates a zip archive from a directory', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = yield ZipPackage_1.default.create(FOO_DIR);
            const content = yield pkg.getContent('foo.txt');
            chai_1.assert.equal(content.toString(), 'foo');
        }));
        it('creates a zip archive from a directory with nested subdirectories', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = yield ZipPackage_1.default.create(FOO_NESTED_DIR);
            chai_1.assert.isDefined(pkg);
            const entries = yield pkg.getEntries();
            chai_1.assert.equal(entries.length, 4);
            const baz = yield pkg.getContent('baz/baz.txt');
            chai_1.assert.equal(baz.toString(), 'baz');
        }));
    }));
});
//# sourceMappingURL=ZipPackage.spec.js.map