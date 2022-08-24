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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const clime_1 = require("clime");
const printUtils_1 = require("../../printUtils");
const __1 = require("../../..");
const interactive_1 = require("../../interactive");
class KeyOptions extends clime_1.Options {
    constructor() {
        super(...arguments);
        this.alias = 'ethpkg';
        this.password = undefined;
        this.keystorePath = undefined;
    }
}
__decorate([
    clime_1.option({
        flag: 'a',
        description: 'alias name for key',
        default: 'ethpkg'
    }),
    __metadata("design:type", String)
], KeyOptions.prototype, "alias", void 0);
__decorate([
    clime_1.option({
        flag: 'p',
        description: 'WARNING: use interactive mode: password for key',
        required: false
    }),
    __metadata("design:type", String)
], KeyOptions.prototype, "password", void 0);
__decorate([
    clime_1.option({
        flag: 'k',
        description: 'keystore path',
        required: false
    }),
    __metadata("design:type", String)
], KeyOptions.prototype, "keystorePath", void 0);
exports.KeyOptions = KeyOptions;
let default_1 = class default_1 extends clime_1.Command {
    execute(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { alias, password, keystorePath } = options;
            const keyManager = new __1.KeyStore(keystorePath);
            const printer = printUtils_1.createCLIPrinter();
            // FIXME ask user interactive for alias
            // FIXME if alias exists use different default
            printer.print(`Creating a new key with alias "${alias}"`);
            let keyInfo;
            try {
                const result = yield keyManager.createKey({
                    alias,
                    listener: printer.listener,
                    password: () => __awaiter(this, void 0, void 0, function* () {
                        if (password) {
                            return password;
                        }
                        const userPassword = yield interactive_1.getPasswordFromUser({ repeat: true });
                        return userPassword;
                    })
                });
                keyInfo = result.info;
            }
            catch (error) {
                printer.fail(error);
            }
            if (!keyInfo) {
                return printer.fail('Key could not be created');
            }
            const { address, filePath } = keyInfo;
            printer.print(`Success! New key with address ${address} created at:\n${filePath}`);
        });
    }
};
__decorate([
    clime_1.metadata,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [KeyOptions]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'Create a new key for signing',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=new.js.map