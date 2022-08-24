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
const GitHub_1 = __importDefault(require("./GitHub"));
const nock_1 = __importDefault(require("nock"));
const Downloader_1 = require("../Downloader");
const TarPackage_1 = __importDefault(require("../PackageManager/TarPackage"));
const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
const releaseResponsePath = path_1.default.join(FIXTURES, 'ServerResponses', 'GitHub', 'githubReleases.json');
const prepareFixture = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield Downloader_1.fetch('GET', 'https://api.github.com/repos/ethereum/grid-ui/releases', {
        headers: {
            accept: ['application/vnd.github.v3+json'],
            'user-agent': ['octokit.js/16.35.0 Node.js/12.10.0 (macOS Catalina; x64)'],
            'Accept-Encoding': ['gzip,deflate'],
        }
    });
    fs_1.default.writeFileSync(releaseResponsePath, data.toString());
    console.log('fixture data written');
});
describe('Github', function () {
    this.timeout(120 * 1000);
    it.skip('prepare fixture data', () => __awaiter(this, void 0, void 0, function* () {
        yield prepareFixture();
    }));
    const mockResponse = fs_1.default.readFileSync(releaseResponsePath);
    const scope = nock_1.default('https://api.github.com', { allowUnmocked: true })
        .persist()
        .head('/repos/ethereum/grid-ui/releases')
        .reply(200, 'ok')
        .persist() // don't remove interceptor after request -> always return mock obj
        .get('/repos/ethereum/grid-ui/releases')
        .reply(200, JSON.parse(mockResponse.toString()));
    describe('async listReleases(options? : FetchOptions): Promise<IRelease[]> ', function () {
        it('fetches a list of releases', () => __awaiter(this, void 0, void 0, function* () {
            const github = new GitHub_1.default({ owner: 'ethereum', project: 'grid-ui' });
            const releases = yield github.listReleases();
            chai_1.assert.equal(releases.length, 60);
        }));
    });
    describe.skip('async publish(pkg: IPackage)', function () {
        it('publishes a package', () => __awaiter(this, void 0, void 0, function* () {
            // requires process.env.GITHUB_TOKEN
            const github = new GitHub_1.default({ owner: 'philipplgh', project: 'ethpkg' });
            const pkg = yield TarPackage_1.default.from(path_1.default.join(FIXTURES, 'foo.tar.gz'));
            const result = yield github.publish(pkg);
            chai_1.assert.isDefined(result);
        }));
    });
});
//# sourceMappingURL=GitHub.spec.js.map