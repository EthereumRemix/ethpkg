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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const task_1 = require("../task");
const clime_1 = require("clime");
const enquirer_1 = require("enquirer");
const __1 = require("../..");
const InputFilepath_1 = require("../lib/InputFilepath");
const signFlow_1 = require("../lib/signFlow");
const EthKeystore_1 = require("../lib/EthKeystore");
const util_1 = require("../../util");
const signFile = (inputFilePath, privateKey, inplace = false) => __awaiter(this, void 0, void 0, function* () {
    task_1.startTask('Signing file');
    const pkg = yield __1.pkgsign.sign(inputFilePath, privateKey);
    if (pkg) {
        const buildOutpath = (pkgPath) => {
            let ext = path_1.default.extname(pkgPath);
            const basename = path_1.default.basename(pkgPath, ext);
            // ext = '.epk'
            const dirname = path_1.default.dirname(pkgPath);
            const pkgPathOut = `${dirname}/${basename}_signed${ext}`;
            return pkgPathOut;
        };
        const outPath = inplace ? inputFilePath : buildOutpath(inputFilePath);
        yield pkg.writePackage(outPath);
        task_1.succeed(`Signed package written to "${outPath}"`);
    }
    else {
        task_1.failed(`Package could not be signed`);
    }
});
exports.startSignFlow = (inputPath, keyFilePath) => __awaiter(this, void 0, void 0, function* () {
    const selectedSigningMethod = yield signFlow_1.getSingingMethod(inputPath);
    switch (selectedSigningMethod) {
        case signFlow_1.SIGNING_METHOD.PRIVATE_KEY: {
            const { privateKey } = yield signFlow_1.getPrivateKey();
            if (!privateKey) {
                console.log('>> private key not valid or not able to parse');
                return;
            }
            yield signFile(inputPath, privateKey);
            break;
        }
        case signFlow_1.SIGNING_METHOD.EXTERNAL_SIGNER: {
            const externalSigner = yield signFlow_1.getExternalSigner();
            console.log('selected external signer is', externalSigner);
            break;
        }
    }
});
class SignOptions extends clime_1.Options {
    constructor() {
        super(...arguments);
        this.overwrite = false;
        this.publish = false;
    }
}
__decorate([
    clime_1.option({
        flag: 'o',
        description: 'WARNING: will overwite package contents',
    }),
    __metadata("design:type", Boolean)
], SignOptions.prototype, "overwrite", void 0);
__decorate([
    clime_1.option({
        flag: 'p',
        description: 'will trigger npm publish if a signed tarball is found',
    }),
    __metadata("design:type", Boolean)
], SignOptions.prototype, "publish", void 0);
exports.SignOptions = SignOptions;
let default_1 = class default_1 extends clime_1.Command {
    execute(inputPath, keyFilePath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const pkgJsonPath = path_1.default.join(process.cwd(), 'package.json');
            let npmPackageFlow = false;
            let pkgFileName = '';
            let pkgJson = null;
            // used as script after `npm pack`
            if (!inputPath) {
                if (fs.existsSync(pkgJsonPath)) {
                    pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
                    let { name: pkgName, version: pkgVersion } = pkgJson;
                    pkgName = pkgName.replace('@', '');
                    pkgName = pkgName.replace('/', '-');
                    pkgFileName = `${pkgName}-${pkgVersion}.tgz`;
                    if (fs.existsSync(pkgFileName)) {
                        console.log('INFO: no input file specified but npm package found');
                        inputPath = pkgFileName;
                        npmPackageFlow = true;
                    }
                }
            }
            if (!inputPath) {
                inputPath = yield InputFilepath_1.getUserFilePath('Which zip / tar file do you want to sign?');
            }
            if (!inputPath) {
                console.log('>> input path was not provided');
                return;
            }
            if (!path_1.default.isAbsolute(inputPath)) {
                inputPath = path_1.default.join(process.cwd(), inputPath);
                if (!fs.existsSync(inputPath)) {
                    console.log('>> package not found');
                    return;
                }
            }
            if (!keyFilePath && npmPackageFlow) {
                let projectName = pkgJson && pkgJson.name;
                projectName = projectName.replace('@', '');
                projectName = projectName.replace('/', '-');
                let keyfiles = EthKeystore_1.listKeys();
                keyfiles = keyfiles.filter(k => k.file.includes(projectName));
                if (keyfiles.length > 1) {
                    // ambiguous keys:
                    let { selectedKey } = yield enquirer_1.prompt(EthKeystore_1.questionKeySelect(keyfiles));
                    keyFilePath = selectedKey.keyFile;
                }
                else if (keyfiles.length === 1) {
                    keyFilePath = keyfiles[0].filePathFull;
                    console.log('>> keyfile for project auto-detected: ' + keyFilePath);
                }
                else {
                    console.log('>> keyfile could not be auto-detected');
                    // ignore ?
                }
            }
            let inplace = options && options.overwrite;
            if (npmPackageFlow) {
                inplace = true;
            }
            if (keyFilePath) {
                const privateKey = yield EthKeystore_1.getPrivateKeyFromEthKeyfile(keyFilePath);
                if (!privateKey) {
                    console.log('>> private key not valid or not able to parse');
                    return;
                }
                const res = yield signFile(inputPath, privateKey, inplace);
                if (npmPackageFlow && (options && options.publish === true)) {
                    try {
                        util_1.runScriptSync('npm publish', [pkgFileName]);
                    }
                    catch (error) {
                        console.error(error);
                    }
                    fs.unlinkSync(pkgFileName);
                }
                return res;
            }
            yield exports.startSignFlow(inputPath, keyFilePath);
        });
    }
};
__decorate([
    __param(0, clime_1.param({
        name: 'zip | tarball',
        description: 'path to zip or tarball',
        required: false,
    })),
    __param(1, clime_1.param({
        name: 'key file',
        description: 'path to key file',
        required: false,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, SignOptions]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'sign a package',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=sign.js.map