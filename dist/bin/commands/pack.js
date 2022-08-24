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
const fs_1 = __importDefault(require("fs"));
const clime_1 = require("clime");
const PackageManager_1 = __importDefault(require("../../PackageManager/PackageManager"));
const printUtils_1 = require("../printUtils");
const FilenameHeuristics_1 = require("../../utils/FilenameHeuristics");
const FilenameUtils_1 = require("../../utils/FilenameUtils");
const chalk_1 = __importDefault(require("chalk"));
const existsInDir = (dirPath, fileNames) => {
    const fullPaths = fileNames.map(f => path_1.default.join(dirPath, f));
    return fullPaths.some(p => fs_1.default.existsSync(p));
};
let default_1 = class default_1 extends clime_1.Command {
    execute(inputDirPath, packageName) {
        return __awaiter(this, void 0, void 0, function* () {
            inputDirPath = path_1.default.resolve(process.cwd(), inputDirPath);
            const pm = new PackageManager_1.default();
            const printer = printUtils_1.createCLIPrinter();
            printer.print(`Create package from input: "${inputDirPath}" :`, {
                isTask: false,
                bold: false
            });
            const version = FilenameHeuristics_1.extractVersionFromString(packageName) || FilenameHeuristics_1.extractVersionFromString(inputDirPath);
            if (!version) {
                console.log(`${chalk_1.default.yellow('WARNING:')} packages should be versioned but a version could not be parsed from package name`);
            }
            let pkg;
            try {
                if (existsInDir(inputDirPath, ['.npmignore', 'package.json'])) {
                    return console.log('Packing npm modules is not yet supported');
                }
                pkg = yield pm.createPackage(inputDirPath, {
                    compressed: true,
                    fileName: packageName,
                    listener: printer.listener
                });
                try {
                    // try to set metadata for nicer output
                    pkg.metadata = {
                        name: FilenameUtils_1.removeExtension(pkg.fileName),
                        fileName: pkg.fileName,
                        version
                    };
                }
                catch (error) {
                }
            }
            catch (error) {
                return printer.fail(error);
            }
            if (!pkg) {
                return printer.fail('Package could not be created');
            }
            yield printUtils_1.printFormattedPackageInfo(pkg);
            try {
                const filePath = path_1.default.join(inputDirPath, '..', pkg.fileName);
                yield pkg.writePackage(filePath);
                printer.print(`Package written to: ${filePath}`);
            }
            catch (error) {
                return printer.fail('Could not write package: ' + error.message);
            }
        });
    }
};
__decorate([
    __param(0, clime_1.param({
        name: 'path',
        description: 'Path to the directory',
        required: false,
        default: '.'
    })),
    __param(1, clime_1.param({
        name: 'package name',
        description: 'Name of the package - should include version',
        required: false,
        default: undefined
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'Creates a package from a directory',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=pack.js.map