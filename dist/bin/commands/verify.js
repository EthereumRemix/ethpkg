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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const clime_1 = require("clime");
const __1 = require("../..");
const task_1 = require("../task");
const util_1 = require("../../util");
const formatPrintResult = (result) => {
    if (result.error) {
        task_1.failed(result.error.message);
        return;
    }
    if (!result.isTrusted) {
        console.log('\nWARNING: this key is not certified with a trusted signature!');
        console.log('There is no indication that the signature belongs to the package owner');
    }
    if (result.isValid /*FIXME && result.isTrusted*/) {
        const signerAddresses = result.signers.map(s => s.address).join(',');
        task_1.succeed(`package contents passed integrity checks and are signed by [${signerAddresses}]`);
    }
    else {
        task_1.failed('invalid package');
    }
};
let default_1 = class default_1 extends clime_1.Command {
    execute(pkgPath, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const isNPM = pkgPath && !fs_1.default.existsSync(pkgPath) && !fs_1.default.existsSync(path_1.default.join(process.cwd(), pkgPath));
            if (isNPM) {
                task_1.startTask('npm download');
                let tempPkgPath = yield util_1.downloadNpmPackage(pkgPath);
                if (tempPkgPath) {
                    task_1.succeed(`npm package downloaded to ${tempPkgPath}`);
                }
                else {
                    return task_1.failed(`npm package could not be retrieved`);
                }
                task_1.startTask('npm package verification');
                const result = yield __1.pkgsign.verify(tempPkgPath, address);
                return formatPrintResult(result);
            }
            if (!fs_1.default.existsSync(pkgPath)) {
                // try to expand path
                pkgPath = path_1.default.join(process.cwd(), pkgPath);
            }
            if (!fs_1.default.existsSync(pkgPath)) {
                console.log('>> package could not be found at location: ' + pkgPath);
            }
            task_1.startTask('verification');
            const result = yield __1.pkgsign.verify(pkgPath, address);
            return formatPrintResult(result);
        });
    }
};
__decorate([
    __param(0, clime_1.param({
        name: 'zip | tarball',
        description: 'path to zip or tarball',
        required: true,
    })),
    __param(1, clime_1.param({
        name: 'address',
        description: 'Ethereum address',
        required: false,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'verify a package',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=verify.js.map