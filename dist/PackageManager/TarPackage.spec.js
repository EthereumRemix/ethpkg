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
const TarPackage_1 = __importDefault(require("./TarPackage"));
const chai_1 = require("chai");
const util_1 = require("../util");
const PackageUtils_1 = require("../utils/PackageUtils");
describe('TarPackage (IPackage)', () => {
    const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
    const FOO_PACKAGE_COMPRESSED = path_1.default.join(FIXTURES, 'foo.tar.gz');
    const FOO_PACKAGE_DECOMPRESSED = path_1.default.join(FIXTURES, 'foo.tar');
    const FOO_PACKAGE_WRITE_COMPRESSED = path_1.default.join(FIXTURES, 'foo_write_test.tar.gz');
    const FOO_DIR = path_1.default.join(FIXTURES, 'foo');
    const FOO_NESTED_DIR = path_1.default.join(FIXTURES, 'foo_nested');
    const BAZ_TXT = path_1.default.join(FIXTURES, 'baz.txt');
    describe('loadBuffer(buf: Buffer): Promise<void> ', () => __awaiter(void 0, void 0, void 0, function* () {
        it('create an IPackage from tar buffer', () => __awaiter(void 0, void 0, void 0, function* () {
            const buf = fs_1.default.readFileSync(FOO_PACKAGE_COMPRESSED);
            const pkg = new TarPackage_1.default('my-package.tar.gz');
            yield pkg.loadBuffer(buf);
            const entries = yield pkg.getEntries();
            chai_1.assert.equal(entries.length, 3);
        }));
    }));
    describe('async getEntries(): Promise<IPackageEntry[]>', () => {
        it('returns all entries (files and dirs) from tar package', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = new TarPackage_1.default(FOO_PACKAGE_COMPRESSED);
            const entries = yield pkg.getEntries();
            // ./foo/ & ./foo/foo.txt & ./foo/bar.txt
            chai_1.assert.equal(entries.length, 3);
        }));
    });
    describe('async getEntry(relativePath: string): Promise<IPackageEntry | undefined>', () => __awaiter(void 0, void 0, void 0, function* () {
        it('finds an entry by its relative path', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = new TarPackage_1.default(FOO_PACKAGE_COMPRESSED);
            const entry = yield pkg.getEntry('/foo/bar.txt');
            chai_1.assert.isDefined(entry);
        }));
    }));
    describe('async getContent(relativePath: string): Promise<Buffer>', () => __awaiter(void 0, void 0, void 0, function* () {
        it(`finds an entry by its relative path and returns the file's content`, () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = new TarPackage_1.default(FOO_PACKAGE_COMPRESSED);
            const content = yield pkg.getContent('foo/bar.txt');
            chai_1.assert.equal(content.toString(), 'bar');
        }));
    }));
    describe('addEntry(relativePath: string, file: IFile) : Promise<string>', () => __awaiter(void 0, void 0, void 0, function* () {
        it('adds a file to a newly created package', () => __awaiter(void 0, void 0, void 0, function* () {
            // NOTE: this will NOT work:
            // const pkg = await new TarPackage().loadBuffer(Buffer.from(''))
            const pkg = yield TarPackage_1.default.create('my-package.tar');
            yield pkg.addEntry('baz.txt', PackageUtils_1.toIFile('baz.txt', 'baz'));
            const content = yield pkg.getContent('baz.txt');
            chai_1.assert.equal(content.toString(), 'baz');
        }));
        it('adds a file to an existing <decompressed> tar package', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = new TarPackage_1.default(FOO_PACKAGE_DECOMPRESSED);
            const entry = yield pkg.getEntry('baz.txt');
            chai_1.assert.isUndefined(entry);
            // prepare file
            const file = util_1.localFileToIFile(BAZ_TXT);
            yield pkg.addEntry('baz.txt', file);
            const content = yield pkg.getContent('baz.txt');
            chai_1.assert.equal(content.toString(), 'baz');
        }));
        it('adds a file to an existing <compressed> tar package', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = new TarPackage_1.default(FOO_PACKAGE_COMPRESSED);
            const entry = yield pkg.getEntry('baz.txt');
            chai_1.assert.isUndefined(entry);
            // prepare file
            const file = util_1.localFileToIFile(BAZ_TXT);
            yield pkg.addEntry('baz.txt', file);
            const content = yield pkg.getContent('baz.txt');
            chai_1.assert.equal(content.toString(), 'baz');
        }));
        it('overwrites existing files', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = new TarPackage_1.default(FOO_PACKAGE_COMPRESSED);
            // check that foo/bar exists and has content 'bar'
            let content = yield pkg.getContent('foo/bar.txt');
            chai_1.assert.equal(content.toString(), 'bar');
            // prepare file
            const file = util_1.localFileToIFile(BAZ_TXT);
            // overwrite foo/bar.txt with file baz.txt
            yield pkg.addEntry('foo/bar.txt', file);
            // read file again
            const content2 = yield pkg.getContent('foo/bar.txt');
            // contents must not be same
            chai_1.assert.notEqual(content.toString(), content2.toString());
            chai_1.assert.equal(content2.toString(), fs_1.default.readFileSync(BAZ_TXT, 'utf8'));
        }));
    }));
    describe('static async create(dirPathOrName : string) : Promise<TarPackage>', () => __awaiter(void 0, void 0, void 0, function* () {
        it('creates an empty tar if dirPathOrName argument is not a path', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = yield TarPackage_1.default.create('my-package.tar');
            const entries = yield pkg.getEntries();
            chai_1.assert.equal(entries.length, 0);
        }));
        it('creates a tar archive from a directory', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = yield TarPackage_1.default.create(FOO_DIR);
            const content = yield pkg.getContent('foo.txt');
            chai_1.assert.equal(content.toString(), 'foo');
        }));
        it('creates a tar archive from a directory with nested subdirectories', () => __awaiter(void 0, void 0, void 0, function* () {
            const pkg = yield TarPackage_1.default.create(FOO_NESTED_DIR);
            chai_1.assert.isDefined(pkg);
            const entries = yield pkg.getEntries();
            // FIXME inconsistency with zip: it should create a dir entry and have 4 entries
            chai_1.assert.equal(entries.length, 3);
            const baz = yield pkg.getContent('baz/baz.txt');
            chai_1.assert.equal(baz.toString(), 'baz');
        }));
    }));
    describe('async writePackage(outPath: string): Promise<string>', () => {
        it('compresses the contents if the outPath contains gzip extension', () => __awaiter(void 0, void 0, void 0, function* () {
            let pkg = yield TarPackage_1.default.create(FOO_DIR);
            yield pkg.writePackage(FOO_PACKAGE_WRITE_COMPRESSED, { overwrite: true });
            const pkg2 = yield TarPackage_1.default.from(FOO_PACKAGE_WRITE_COMPRESSED);
            chai_1.assert.isTrue(pkg2.isGzipped);
            let content = yield pkg2.getContent('./bar.txt');
            chai_1.assert.equal(content.toString(), 'bar');
        }));
        it('can overwrite existing packages', () => {
        });
    });
    describe.skip('static async from(packagePath : string) : Promise<IPackage>', () => { });
});
//# sourceMappingURL=TarPackage.spec.js.map