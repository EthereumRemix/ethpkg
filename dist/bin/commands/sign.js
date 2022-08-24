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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const clime_1 = require("clime");
const PackageManager_1 = __importDefault(require("../../PackageManager/PackageManager"));
const FilenameUtils_1 = require("../../utils/FilenameUtils");
const printUtils_1 = require("../printUtils");
const interactive_1 = require("../interactive");
const util_1 = require("../../util");
const buildOutputPathSigned = (pkgPath) => {
    let ext = FilenameUtils_1.getExtension(pkgPath);
    const basename = path_1.default.basename(pkgPath, ext);
    // ext = '.epk'
    const dirname = path_1.default.dirname(pkgPath);
    const pkgPathOut = `${dirname}/${basename}_signed${ext}`;
    return pkgPathOut;
};
class SignOptions extends clime_1.Options {
    constructor() {
        super(...arguments);
        this.overwrite = false;
        this.alias = undefined;
        this.password = undefined;
        this.inplace = undefined;
        // TODO support this option
        this.createKey = false;
        this.keystorePath = undefined;
        /*
        @option({
          flag: 'a',
          description: 'tries to auto-detect correct key for project',
        })
        autodetectkey: boolean = false;
        @option({
          flag: 'p',
          description: 'will trigger npm publish if a signed tarball is found',
        })
        publish: boolean = false;
        @option({
          flag: 'c',
          description: 'creates a key',
        })
        createKey: boolean = false;
        */
    }
}
__decorate([
    clime_1.option({
        flag: 'o',
        description: 'WARNING: will overwite package contents',
        default: false
    }),
    __metadata("design:type", Boolean)
], SignOptions.prototype, "overwrite", void 0);
__decorate([
    clime_1.option({
        flag: 'a',
        description: 'alias name for key',
        default: undefined
    }),
    __metadata("design:type", String)
], SignOptions.prototype, "alias", void 0);
__decorate([
    clime_1.option({
        flag: 'p',
        description: 'WARNING: use interactive mode: password for key',
        required: false
    }),
    __metadata("design:type", String)
], SignOptions.prototype, "password", void 0);
__decorate([
    clime_1.option({
        flag: 'i',
        description: 'inplace will overwite the package with the signed version',
        required: false
    }),
    __metadata("design:type", Boolean)
], SignOptions.prototype, "inplace", void 0);
__decorate([
    clime_1.option({
        flag: 'c',
        description: 'create new key',
        required: false,
        default: false
    }),
    __metadata("design:type", Boolean)
], SignOptions.prototype, "createKey", void 0);
__decorate([
    clime_1.option({
        flag: 'k',
        description: 'key or keystore path',
        required: false
    }),
    __metadata("design:type", String)
], SignOptions.prototype, "keystorePath", void 0);
exports.SignOptions = SignOptions;
let default_1 = class default_1 extends clime_1.Command {
    execute(inputPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const printer = printUtils_1.createCLIPrinter();
            // FIXME support ENS
            /*
            TODO interactive mode
            inputPath = await getUserFilePath('Which package (zip, tar) file do you want to sign?', inputPath)
            if (!inputPath || ) {
              console.log(`>> File not found or invalid: "${inputPath}"`)
              return
            }
            */
            inputPath = path_1.default.resolve(inputPath);
            let outPath = options.inplace ? inputPath : buildOutputPathSigned(inputPath);
            let shouldOverwite = options.inplace || options.overwrite;
            if (fs_1.default.existsSync(outPath) && !shouldOverwite) {
                return printer.fail('Package exists already! Use "overwrite" option');
            }
            const packageManager = new PackageManager_1.default();
            let { keystorePath, alias } = options;
            let pkg;
            try {
                pkg = yield packageManager.getPackage(inputPath, {
                    listener: printer.listener
                });
                if (!pkg) {
                    return printer.fail(`Package not found: "${inputPath}"`);
                }
                // if keystore is file path split in keystore & filename
                if (keystorePath && util_1.isFilePath(keystorePath)) {
                    // this overwrites any alias options
                    alias = path_1.default.basename(keystorePath);
                    keystorePath = path_1.default.resolve(path_1.default.dirname(keystorePath));
                }
                const privateKey = yield packageManager.getSigningKey({
                    keyStore: keystorePath,
                    alias,
                    listener: printer.listener,
                    password: (info) => __awaiter(this, void 0, void 0, function* () {
                        if (options.password) {
                            return options.password;
                        }
                        const password = yield interactive_1.getPasswordFromUser(info);
                        return password;
                    }),
                    selectKeyCallback: (keys) => __awaiter(this, void 0, void 0, function* () {
                        const result = yield interactive_1.getSelectedKeyFromUser(keys);
                        return result;
                    })
                });
                if (!privateKey) {
                    return printer.fail('Could not retrieve private key to sign package');
                }
                pkg = yield packageManager.signPackage(pkg, privateKey, {
                    listener: printer.listener
                });
                const verificationInfo = yield packageManager.verifyPackage(pkg);
                yield printUtils_1.printFormattedVerificationResult(verificationInfo, false);
            }
            catch (error) {
                return printer.fail(error);
            }
            if (!pkg) {
                return printer.fail('Something went wrong');
            }
            try {
                yield pkg.writePackage(outPath, {
                    overwrite: shouldOverwite
                });
            }
            catch (error) {
                return printer.fail(error);
            }
            printer.print(`Success! Package signed and written to ${outPath}`);
        });
    }
};
__decorate([
    __param(0, clime_1.param({
        name: 'zip | tarball',
        description: 'path to zip or tarball',
        required: true,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SignOptions]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'Signs a package',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=sign.js.map