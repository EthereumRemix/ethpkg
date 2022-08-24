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
const chai_1 = require("chai");
const Ipfs_1 = __importDefault(require("./Ipfs"));
const TarPackage_1 = __importDefault(require("../PackageManager/TarPackage"));
const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
const UNSIGNED_FOO_TAR = path_1.default.join(FIXTURES, 'foo.tar.gz');
const SIGNED_FOO_TAR = path_1.default.join(FIXTURES, 'foo_signed.tar.gz');
describe('IPFS', function () {
    this.timeout(120 * 1000);
    describe.skip('async listReleases(options? : FetchOptions): Promise<IRelease[]> ', function () {
        it('fetches a list of releases published to ipfs', () => __awaiter(this, void 0, void 0, function* () {
            const ipfs = new Ipfs_1.default();
            const releases = yield ipfs.listReleases();
            // console.log('releases', releases)
            chai_1.assert.equal(releases.length, 1);
        }));
    });
    describe('async publish(pkg: IPackage)', function () {
        it('publishes a package', () => __awaiter(this, void 0, void 0, function* () {
            const ipfs = new Ipfs_1.default();
            const pkg = yield TarPackage_1.default.from(UNSIGNED_FOO_TAR);
            const result = yield ipfs.publish(pkg);
            console.log('package published', result);
            chai_1.assert.isDefined(result);
        }));
    });
});
//# sourceMappingURL=Ipfs.spec.js.map