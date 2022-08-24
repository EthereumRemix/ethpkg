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
Object.defineProperty(exports, "__esModule", { value: true });
const clime_1 = require("clime");
const enquirer_1 = require("enquirer");
const CERT_TYPE = {
    SELF: 'SELF_SIGNED'
};
const getInput = (prop, message) => __awaiter(void 0, void 0, void 0, function* () {
    const question = {
        type: 'input',
        name: prop,
        message
    };
    const answer = yield enquirer_1.prompt(question);
    return answer[prop];
});
const getCertType = () => __awaiter(void 0, void 0, void 0, function* () {
    const questionCertType = [{
            type: 'select',
            name: 'type',
            message: 'What kind of certificate do you want to create?',
            initial: 0,
            choices: [
                { name: `${CERT_TYPE.SELF}`, message: 'Self signed' },
            ]
        }];
    let cert_type = yield enquirer_1.prompt(questionCertType);
    return cert_type.type;
});
let default_1 = class default_1 extends clime_1.Command {
    execute(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const cert_type = yield getCertType();
            name = yield getInput('name', 'What is the cert holder\'s name or username?');
            const email = yield getInput('email', 'What is the cert holder\'s email?');
            const subjectInfo = {
                name,
                email
            };
            const options = {
                csrType: 2 // email
            };
            /*
            const { privateKey } = await getPrivateKey()
            const csr = await cert.csr(subjectInfo, privateKey, options)
            
            const outPath = path.join(process.cwd(), `self_signed_cert_${Date.now()}.json`)
            const certData = JSON.stringify(csr, null, 2)
            fs.writeFileSync(outPath, certData)
            progress(`Certificate: \n\n${JSON.stringify(csr, null, 2)}\nwritten to ${outPath}`)
            */
        });
    }
};
__decorate([
    __param(0, clime_1.param({
        name: 'name',
        description: 'your username or full name',
        required: false,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'creates certificates',
    })
], default_1);
exports.default = default_1;
//# sourceMappingURL=cert.js.map