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
const Azure_1 = __importDefault(require("./Azure"));
const nock_1 = __importDefault(require("nock"));
const Downloader_1 = require("../Downloader");
const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
const releaseResponsePath = path_1.default.join(FIXTURES, 'ServerResponses', 'Azure', 'azureReleases.xml');
const mockResponse = fs_1.default.readFileSync(releaseResponsePath);
const prepareFixture = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield Downloader_1.download('https://gethstore.blob.core.windows.net/builds?restype=container&comp=list');
    fs_1.default.writeFileSync(releaseResponsePath, data.toString());
    console.log('fixture data written');
});
describe('Azure', () => {
    // await prepareFixture().then => run tests
    const scope = nock_1.default('https://gethstore.blob.core.windows.net', { allowUnmocked: false })
        .persist()
        .head('/builds?restype=container&comp=list')
        .reply(200, 'ok')
        .persist() // don't remove interceptor after request -> always return mock obj
        .get('/builds?restype=container&comp=list')
        .reply(200, mockResponse);
    describe('async listReleases(options? : FetchOptions): Promise<IRelease[]> ', function () {
        it('fetches a list of releases', () => __awaiter(this, void 0, void 0, function* () {
            const azure = new Azure_1.default({ project: 'gethstore' });
            const releases = yield azure.listReleases();
            chai_1.assert.equal(releases.length, 2369);
        }));
    });
});
//# sourceMappingURL=Azure.spec.js.map