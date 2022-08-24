"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
const clime_1 = require("clime");
const PackageManager_1 = __importDefault(require("../../PackageManager/PackageManager"));
const printUtils_1 = require("../printUtils");
class ListOptions extends clime_1.Options {
    constructor() {
        super(...arguments);
        this.attributes = 'fileName,version';
    }
}
__decorate([
    clime_1.option({
        flag: 'a',
        description: 'comma separated list of attributes to display',
        default: 'fileName,version,updated_at'
    }),
    __metadata("design:type", String)
], ListOptions.prototype, "attributes", void 0);
exports.ListOptions = ListOptions;
let default_1 = class default_1 extends clime_1.Command {
    execute(spec, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { attributes } = options;
            // console.log('attributes', attributes)
            const packageManager = new PackageManager_1.default();
            let releases = [];
            const printer = printUtils_1.createCLIPrinter([printUtils_1.PROCESSES.FETCHING_RELEASE_LIST, printUtils_1.PROCESSES.FILTER_RELEASE_LIST]);
            try {
                releases = yield packageManager.listPackages(spec, {
                    limit: 50,
                    prefix: undefined,
                    listener: printer.listener
                });
            }
            catch (error) {
                return printer.fail(error);
            }
            printUtils_1.printFormattedReleaseList(releases, attributes);
        });
    }
};
__decorate([
    __param(0, clime_1.param({
        name: 'query',
        description: 'package query',
        required: true,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ListOptions]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'Lists the release info for all packages',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=list.js.map