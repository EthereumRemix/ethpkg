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
const path_1 = __importDefault(require("path"));
const PackageManager_1 = __importDefault(require("../../PackageManager/PackageManager"));
const clime_1 = require("clime");
const printUtils_1 = require("../printUtils");
const interactive_1 = require("../interactive");
class PublishOptions extends clime_1.Options {
    constructor() {
        super(...arguments);
        this.sign = undefined;
    }
}
__decorate([
    clime_1.option({
        flag: 's',
        description: 'signing package before publishing it',
        default: undefined
    }),
    __metadata("design:type", Boolean)
], PublishOptions.prototype, "sign", void 0);
__decorate([
    clime_1.option({
        flag: 'k',
        description: 'signing key alias or address',
        default: undefined
    }),
    __metadata("design:type", String)
], PublishOptions.prototype, "key", void 0);
__decorate([
    clime_1.option({
        flag: 'l',
        description: 'login before publish',
        default: false
    }),
    __metadata("design:type", Boolean)
], PublishOptions.prototype, "login", void 0);
__decorate([
    clime_1.option({
        flag: 'r',
        description: 'repository',
        default: undefined
    }),
    __metadata("design:type", String)
], PublishOptions.prototype, "repository", void 0);
exports.PublishOptions = PublishOptions;
let default_1 = class default_1 extends clime_1.Command {
    execute(packagePath, repository, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, sign: signPackage } = options;
            const packageManager = new PackageManager_1.default();
            const printer = printUtils_1.createCLIPrinter();
            packagePath = path_1.default.resolve(packagePath);
            printer.print(`Publishing package "${packagePath}" to hoster "${repository}"`, { isTask: false });
            if (key) {
                printer.print(`Sign package using key "${key}"`, { isTask: false });
            }
            let _repository = repository;
            if (repository === 'github') {
                if (!options.repository) {
                    return printer.fail('The flag -r for the repository is required with github release strategy');
                }
                const { username, password } = yield interactive_1.getCredentialsFromUser();
                _repository = {
                    name: 'github',
                    owner: username,
                    project: options.repository,
                    auth: password
                };
            }
            try {
                const result = yield packageManager.publishPackage(packagePath, {
                    repository: _repository,
                    listener: printer.listener,
                    signPackage: signPackage,
                    keyInfo: {
                        alias: key,
                        password: () => __awaiter(this, void 0, void 0, function* () {
                            const password = yield interactive_1.getPasswordFromUser();
                            return password;
                        }),
                        selectKeyCallback: (keys) => __awaiter(this, void 0, void 0, function* () {
                            const result = yield interactive_1.getSelectedKeyFromUser(keys);
                            return result;
                        })
                    }
                });
                console.log('result', result);
            }
            catch (error) {
                printer.fail(error);
            }
        });
    }
};
__decorate([
    __param(0, clime_1.param({
        description: 'path to the package',
        name: 'package path',
        required: true
    })),
    __param(1, clime_1.param({
        description: 'where to publish the package',
        name: 'repository name',
        required: false,
        default: 'ipfs'
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, PublishOptions]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'Publishes a package',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=publish.js.map