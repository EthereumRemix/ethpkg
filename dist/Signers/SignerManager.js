"use strict";
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
const ISigner_1 = require("../PackageSigner/ISigner");
const PrivateKeySigner_1 = __importDefault(require("./PrivateKeySigner"));
const MetamaskSigner_1 = __importDefault(require("./MetamaskSigner"));
const GethSigner_1 = __importDefault(require("./GethSigner"));
class SignerManager {
    constructor() {
        this.signers = {
            'privatekey': PrivateKeySigner_1.default,
            'metamask': MetamaskSigner_1.default,
            'geth': GethSigner_1.default
        };
        this.signerInstances = {};
    }
    addSigner(name, signer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ISigner_1.instanceofISigner(signer)) {
                this.signerInstances[name] = signer;
            }
            else {
                this.signers[name] = signer;
            }
        });
    }
    getSigner(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (name in this.signers) {
                return new this.signers[name]();
            }
            if (name in this.signerInstances) {
                return this.signerInstances[name];
            }
            return undefined;
        });
    }
    listSigners() {
        return __awaiter(this, void 0, void 0, function* () {
            return [...Object.keys(this.signers), ...Object.keys(this.signerInstances)];
        });
    }
    removeSigner(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return delete this.signers[name] || delete this.signerInstances[name];
        });
    }
}
exports.default = SignerManager;
//# sourceMappingURL=SignerManager.js.map