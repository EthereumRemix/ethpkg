"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const enquirer_1 = require("enquirer");
const EthKeystore_1 = require("./EthKeystore");
const PEMFile_1 = require("./PEMFile");
exports.SIGNING_METHOD = {
    'PRIVATE_KEY': 'Local Private Key',
    'EXTERNAL_SIGNER': 'External Signer'
};
exports.KEY_STORAGE = {
    'ETH': 'Ethereum Keystore',
    'ETH_KEYFILE': 'Ethereum Keyfile',
    'PEM': 'PEM File'
};
exports.getSingingMethod = (fileName) => __awaiter(this, void 0, void 0, function* () {
    const questionSigningMethod = (fileName) => ({
        type: 'select',
        name: 'method',
        message: `How do you want to sign "${fileName}"?`,
        initial: 0,
        choices: [
            { name: exports.SIGNING_METHOD.PRIVATE_KEY, message: 'Private Key', value: 'pk' },
            { name: exports.SIGNING_METHOD.EXTERNAL_SIGNER, message: 'External Signer', value: 'signer' }
        ]
    });
    fileName = fileName || 'the data';
    const answersMethod = yield enquirer_1.prompt(questionSigningMethod(fileName));
    return answersMethod.method;
});
exports.getKeyLocation = () => __awaiter(this, void 0, void 0, function* () {
    const questionKeyStorage = [{
            type: 'select',
            name: 'storage',
            message: 'How is the private key stored?',
            initial: 0,
            choices: [
                { name: `${exports.KEY_STORAGE.ETH}`, message: 'Geth Keystore' },
                { name: `${exports.KEY_STORAGE.ETH_KEYFILE}`, message: 'Eth Keyfile' },
                { name: `${exports.KEY_STORAGE.PEM}`, message: 'PEM File' }
            ]
        }];
    const answerKeyLocation = yield enquirer_1.prompt(questionKeyStorage);
    return answerKeyLocation.storage;
});
exports.getExternalSigner = () => __awaiter(this, void 0, void 0, function* () {
    const questionSigner = [{
            type: 'select',
            name: 'format',
            message: 'Which external signer is used?',
            initial: 1,
            choices: [
                { name: 'geth / clef', message: 'geth / clef' },
                { name: 'trezor / ledger', message: 'trezor / ledger' },
                { name: 'metamask', message: 'metamask' },
                { name: 'mobile', message: 'mobile' },
                { name: 'cloud', message: 'cloud' }
            ]
        }];
    let answerExternalSigner = yield enquirer_1.prompt(questionSigner);
    return answerExternalSigner.format;
});
exports.getPrivateKey = () => __awaiter(this, void 0, void 0, function* () {
    const keyLocation = yield exports.getKeyLocation();
    switch (keyLocation) {
        case exports.KEY_STORAGE.ETH: {
            const privateKey = yield EthKeystore_1.getPrivateKeyFromEthKeystore();
            return {
                privateKey
            };
        }
        case exports.KEY_STORAGE.ETH_KEYFILE: {
            const privateKey = yield EthKeystore_1.getPrivateKeyFromEthKeyfile();
            return {
                privateKey
            };
        }
        // helpful debugger: https://lapo.it/asn1js
        // https://github.com/lapo-luchini/asn1js/blob/master/asn1.js#L260
        case exports.KEY_STORAGE.PEM: {
            const privateKey = yield PEMFile_1.getPrivateKeyFromPemFile();
            return {
                privateKey
            };
        }
        default: {
            return {
                privateKey: null
            };
        }
    }
});
//# sourceMappingURL=signFlow.js.map