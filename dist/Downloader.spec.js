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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Downloader = __importStar(require("./Downloader"));
const assert_1 = require("assert");
describe('Downloader', () => {
    describe('async download(_url : string, onProgress = (progress : number) => {}, redirectCount = 0, options = { parallel: 0 }): Promise<Buffer>', function () {
        this.timeout(120 * 1000);
        it('throws on 404', () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield Downloader.download('https://httpstat.us/404');
            }
            catch (error) {
                return chai_1.assert.isDefined(error);
                // error.should.have.value("message", "Contrived Error");
            }
            assert_1.fail();
        }));
    });
});
//# sourceMappingURL=Downloader.spec.js.map