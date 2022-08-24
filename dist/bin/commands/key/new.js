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
const clime_1 = require("clime");
const enquirer_1 = require("enquirer");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// @ts-ignore
const keythereum_1 = __importDefault(require("keythereum"));
const util_1 = require("../../../util");
const task_1 = require("../../task");
/**
 * Generate filename for a keystore file.
 * @param {string} address Ethereum address.
 * @return {string} Keystore filename.
 */
const generateKeystoreFilename = (project, address) => {
    var filename = `ethpkg--UTC--${new Date().toISOString()}--${project}--${address}`;
    // Windows does not permit ":" in filenames, replace all with "-"
    if (process.platform === "win32")
        filename = filename.split(":").join("-");
    return filename;
};
let task = 'Generate new key';
const getProjectNameFromPackageJson = () => {
    const pkgJsonPath = path_1.default.join(process.cwd(), 'package.json');
    if (fs_1.default.existsSync(pkgJsonPath)) {
        try {
            const pkgJson = JSON.parse(fs_1.default.readFileSync(pkgJsonPath, 'utf8'));
            let { name, version } = pkgJson;
            name = name.replace('@', '');
            name = name.replace('/', '-');
            return `${name}-${version}`;
        }
        catch (error) {
            task_1.failed(task, 'project.json could not be parsed');
        }
    }
    else {
        task_1.failed(task, 'project.json not found and no project identifier provided');
    }
};
class KeyOptions extends clime_1.Options {
    constructor() {
        super(...arguments);
        this.projectName = '';
    }
}
__decorate([
    clime_1.option({
        flag: 'p',
        description: 'project name',
    }),
    __metadata("design:type", String)
], KeyOptions.prototype, "projectName", void 0);
exports.KeyOptions = KeyOptions;
let default_1 = class default_1 extends clime_1.Command {
    execute(outPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const keystorePath = util_1.getKeystorePath();
            try {
                if (!fs_1.default.existsSync(keystorePath)) {
                    fs_1.default.mkdirSync(keystorePath, { recursive: true });
                }
            }
            catch (error) {
                task_1.failed(task, 'could not find or create keystore: ' + keystorePath);
                return console.log('err', error);
            }
            // fail fast: this block should be executed before password is asked for
            let projectName = options && options.projectName;
            if (!outPath) {
                if (!projectName) {
                    projectName = getProjectNameFromPackageJson();
                }
                // FIXME should ask / double check path in this case
                if (!projectName) {
                    return task_1.failed(task, 'project.json not found and no project identifier provided');
                }
            }
            const questionKeyPassword = {
                type: 'password',
                name: 'password',
                message: `Enter password to encrypt key`
            };
            const { password } = yield enquirer_1.prompt(questionKeyPassword);
            if (!password) {
                return task_1.failed(task, 'password empty or invalid');
            }
            const dk = keythereum_1.default.create();
            const keyObject = keythereum_1.default.dump(password, dk.privateKey, dk.salt, dk.iv);
            keyObject.usage = `ethpkg-${projectName}`;
            keyObject.version = ('ethpkg-' + keyObject.version);
            if (!outPath) {
                // @ts-ignore
                const keyFileName = generateKeystoreFilename(projectName, keyObject.address);
                outPath = path_1.default.join(keystorePath, keyFileName);
            }
            if (!path_1.default.isAbsolute(outPath)) {
                outPath = path_1.default.join(__dirname, outPath);
            }
            try {
                const result = fs_1.default.writeFileSync(outPath, JSON.stringify(keyObject, null, 2));
                task_1.succeed('Keyfile generated at ' + outPath);
            }
            catch (error) {
                task_1.failed(task, 'Could not write keyfile to ' + outPath);
            }
        });
    }
};
__decorate([
    __param(0, clime_1.param({
        name: 'out',
        description: 'output path for keyfile',
        required: false,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, KeyOptions]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'create a new key for signing',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=new.js.map