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
const Bintray_1 = __importDefault(require("./Bintray"));
const nock_1 = __importDefault(require("nock"));
const Downloader_1 = require("../Downloader");
const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
const releaseResponsePath = path_1.default.join(FIXTURES, 'ServerResponses', 'Bintray', 'bintrayReleases.json');
const prepareFixture = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield Downloader_1.download('https://api.bintray.com/packages/hyperledger-org/besu-repo/besu/files');
    fs_1.default.writeFileSync(releaseResponsePath, data.toString());
    console.log('fixture data written');
});
describe('Bintray', function () {
    this.timeout(120 * 1000);
    it.skip('prepare fixture data', () => __awaiter(this, void 0, void 0, function* () {
        yield prepareFixture();
    }));
    const mockResponse = fs_1.default.readFileSync(releaseResponsePath);
    const scope = nock_1.default('https://api.bintray.com/packages/hyperledger-org/besu-repo/besu', { allowUnmocked: false })
        .persist()
        .head('/files')
        .reply(200, 'ok')
        .persist() // don't remove interceptor after request -> always return mock obj
        .get('/files')
        .reply(200, mockResponse);
    describe('async listReleases(options? : FetchOptions): Promise<IRelease[]> ', function () {
        it('fetches a list of releases', () => __awaiter(this, void 0, void 0, function* () {
            const bintray = new Bintray_1.default({ owner: 'hyperledger-org', project: 'besu-repo/besu' });
            const releases = yield bintray.listReleases();
            chai_1.assert.equal(releases.length, 3166);
        }));
    });
});
//# sourceMappingURL=Bintray.spec.js.map