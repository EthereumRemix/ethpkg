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
const clime_1 = require("clime");
const PackageManager_1 = __importDefault(require("../../PackageManager/PackageManager"));
const printUtils_1 = require("../printUtils");
let default_1 = class default_1 extends clime_1.Command {
    execute(spec, destPath) {
        return __awaiter(this, void 0, void 0, function* () {
            destPath = path_1.default.resolve(destPath);
            const packageManager = new PackageManager_1.default();
            const printer = printUtils_1.createCLIPrinter();
            printer.print(`Download package: "${spec}"`, {
                isTask: false
            });
            let pkg;
            try {
                pkg = yield packageManager.getPackage({
                    spec,
                    destPath,
                    listener: printer.listener
                });
            }
            catch (error) {
                return printer.fail(error);
            }
            if (!pkg) {
                return printer.fail('Package could not be downloaded');
            }
            // console.log('buffer length', packageBuf.length)
            printer.print(`File written to ${pkg.filePath}`);
        });
    }
};
__decorate([
    __param(0, clime_1.param({
        name: 'specifier',
        description: 'package specifier',
        required: true,
    })),
    __param(1, clime_1.param({
        name: 'destPath',
        description: 'destination path',
        required: false,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'Downloads a package',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=download.js.map