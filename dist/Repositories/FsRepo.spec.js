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
const FsRepo_1 = __importDefault(require("./FsRepo"));
const FIXTURES = path_1.default.join(__dirname, '..', '..', 'test', 'fixtures');
const REPO_DIR = path_1.default.join(FIXTURES, 'FsRepo');
describe('FilesystemRepo', function () {
    describe('async listReleases(options? : FetchOptions): Promise<IRelease[]> ', function () {
        // TODO fixture dir does not match expected struct + .json files
        it.skip('fetches a list of releases', () => __awaiter(this, void 0, void 0, function* () {
            const fsRepo = new FsRepo_1.default({ project: REPO_DIR });
            const releases = yield fsRepo.listReleases();
            chai_1.assert.equal(releases.length, 0);
        }));
    });
});
//# sourceMappingURL=FsRepo.spec.js.map