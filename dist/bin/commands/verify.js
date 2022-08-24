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
const printUtils_1 = require("../printUtils");
const PackageManager_1 = __importDefault(require("../../PackageManager/PackageManager"));
let default_1 = class default_1 extends clime_1.Command {
    execute(pkgQuery, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const printer = printUtils_1.createCLIPrinter();
            const packageManager = new PackageManager_1.default();
            printer.print(`Verify package: "${pkgQuery}" ${address ? `against address "${address}"` : ''}`, { isTask: false });
            let pkg;
            try {
                pkg = yield packageManager.getPackage(pkgQuery, {
                    listener: printer.listener
                });
            }
            catch (error) {
                printer.fail(error);
            }
            if (!pkg) {
                return printer.fail(`Could not find or load package: "${pkgQuery}"`);
            }
            let verificationInfo;
            try {
                verificationInfo = yield packageManager.verifyPackage(pkg, {
                    addressOrEnsName: address,
                    listener: printer.listener
                });
            }
            catch (error) {
                return printer.fail(error);
            }
            if (!verificationInfo) {
                return printer.fail('Could not verify release!');
            }
            printUtils_1.printFormattedVerificationResult(verificationInfo);
        });
    }
};
__decorate([
    __param(0, clime_1.param({
        name: 'package query',
        description: 'Path, url, or query string',
        required: true,
    })),
    __param(1, clime_1.param({
        name: 'address',
        description: 'Ethereum address to verify against',
        required: false,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'Verifies a package',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=verify.js.map