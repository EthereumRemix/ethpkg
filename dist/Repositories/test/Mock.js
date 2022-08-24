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
/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
class Mock {
    constructor(testCase) {
        this.name = 'MockRepository';
        this.testCase = testCase;
    }
    getJson(name) {
        try {
            return JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, 'fixtures', `${name}.json`), 'utf8'));
        }
        catch (error) {
            return [];
        }
    }
    listReleases(options) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.testCase) {
                case 'unsorted': return this.getJson('unsorted');
                case 'invalid': return this.getJson('invalid');
                default: return [];
            }
        });
    }
}
exports.default = Mock;
//# sourceMappingURL=Mock.js.map