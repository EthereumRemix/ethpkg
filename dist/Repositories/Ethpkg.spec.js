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
const EthpkgRepo_1 = __importDefault(require("./EthpkgRepo"));
const PackageManager_1 = __importDefault(require("../PackageManager/PackageManager"));
const assert_1 = require("assert");
const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
const UNSIGNED_FOO_TAR = path_1.default.join(FIXTURES, 'foo.tar.gz');
const SIGNED_FOO_TAR = path_1.default.join(FIXTURES, 'foo_signed.tar.gz');
describe.skip('EthpkgRepo', function () {
    this.timeout(120 * 1000);
    describe('async listReleases(options? : FetchOptions): Promise<IRelease[]> ', function () {
        it('does something', () => __awaiter(this, void 0, void 0, function* () {
            const ethpkgRepo = new EthpkgRepo_1.default({ owner: 'ethereum' });
            const releases = yield ethpkgRepo.listReleases();
            // console.log('releases', releases)
            chai_1.assert.equal(releases.length, 7);
        }));
    });
    describe.skip('publish(pkg: IPackage)', function () {
        it('publishes a package', () => __awaiter(this, void 0, void 0, function* () {
            const pm = new PackageManager_1.default();
            const pkg = yield pm.getPackage(UNSIGNED_FOO_TAR);
            if (!pkg) {
                assert_1.fail('could not load package');
            }
            const ethpkgRepo = new EthpkgRepo_1.default({});
            const result = yield ethpkgRepo.publish(pkg);
            console.log('package published', result);
            chai_1.assert.isDefined(result);
        }));
    });
});
//# sourceMappingURL=Ethpkg.spec.js.map