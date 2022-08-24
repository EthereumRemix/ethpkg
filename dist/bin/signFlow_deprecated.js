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
Object.defineProperty(exports, "__esModule", { value: true });
const enquirer_1 = require("enquirer");
exports.SIGNING_METHOD = {
    'PRIVATE_KEY': 'Local Private Key',
    'EXTERNAL_SIGNER': 'External Signer'
};
exports.KEY_STORAGE = {
    'ETH': 'Ethereum Keystore',
    'ETH_KEYFILE': 'Ethereum Keyfile',
    'PEM': 'PEM File',
    'CREATE': 'Create new key'
};
exports.getSingingMethod = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.getKeyLocation = () => __awaiter(void 0, void 0, void 0, function* () {
    const questionKeyStorage = [{
            type: 'select',
            name: 'storage',
            message: 'How is the private key stored?',
            initial: 0,
            choices: [
                { name: `${exports.KEY_STORAGE.ETH}`, message: 'Keystore' },
                { name: `${exports.KEY_STORAGE.ETH_KEYFILE}`, message: 'Keyfile' },
                { name: `${exports.KEY_STORAGE.PEM}`, message: 'PEM Keyfile' },
                { name: `${exports.KEY_STORAGE.PEM}`, message: 'Create new key' },
            ]
        }];
    const answerKeyLocation = yield enquirer_1.prompt(questionKeyStorage);
    return answerKeyLocation.storage;
});
exports.getExternalSigner = () => __awaiter(void 0, void 0, void 0, function* () {
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
/**
 export const getPrivateKeyFromPemFile = async () => {
  const keyFilePath = await getUserFilePath('Provide path to pem keyfile')
  const privateKey = getPrivateKeyFromPEM(keyFilePath)
  return privateKey
}
 */
exports.getPrivateKey = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const keyLocation = yield exports.getKeyLocation();
    switch (keyLocation) {
        case exports.KEY_STORAGE.ETH: {
            // FIXME 
            throw new Error('not implemented');
            /*
            const privateKey = await getPrivateKeyFromEthKeystore()
            return {
              privateKey
            }
            */
        }
        case exports.KEY_STORAGE.ETH_KEYFILE: {
            // FIXME
            throw new Error('not implemented');
            /*
            const privateKey = await getPrivateKeyFromEthKeyfile()
            return {
              privateKey
            }
            */
        }
        // helpful debugger: https://lapo.it/asn1js
        // https://github.com/lapo-luchini/asn1js/blob/master/asn1.js#L260
        case exports.KEY_STORAGE.PEM: {
            // FIXME const privateKey = await getPrivateKeyFromPemFile()
            const privateKey = Buffer.from('');
            return {
                privateKey
            };
        }
        default: {
            return {
                privateKey: undefined
            };
        }
    }
});
//# sourceMappingURL=signFlow_deprecated.js.map