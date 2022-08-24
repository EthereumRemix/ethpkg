"use strict";
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
const util_1 = require("../../util");
const task_1 = require("../task");
const enquirer_1 = require("enquirer");
const InputFilepath_1 = require("./InputFilepath");
exports.listKeys = () => {
    const keystore = util_1.getKeystorePath();
    // TODO we could filter keys here for e.g. a prefix like 'ethpkg' to avoid misuse
    const keyFiles = fs.readdirSync(keystore).map(f => {
        return {
            address: '0x' + f.split('--').pop(),
            'file': f,
            'filePathFull': path_1.default.join(keystore, f)
        };
    });
    return keyFiles;
};
exports.questionKeySelect = (keys) => [{
        type: 'select',
        name: 'selectedKey',
        message: `Which key do you want to use?`,
        initial: '',
        choices: keys.map((k) => ({ name: k.address, message: `${k.address} ("${k.file}")`, keyFile: k.filePathFull, file: k.file })),
        result(value) {
            return this.choices.find((choice) => choice.name === value);
        }
    }];
exports.getKeyFilePath = () => __awaiter(this, void 0, void 0, function* () {
    const keyFilePath = yield InputFilepath_1.getUserFilePath('Path to keyfile used for signing');
    return keyFilePath;
});
exports.getPrivateKeyFromEthKeystore = () => __awaiter(this, void 0, void 0, function* () {
    const keys = exports.listKeys();
    const { selectedKey } = yield enquirer_1.prompt(exports.questionKeySelect(keys));
    const { keyFile, file } = selectedKey;
    return exports.getPrivateKeyFromEthKeyfile(keyFile, file);
});
exports.getPrivateKeyFromEthKeyfile = (keyFile, fileName) => __awaiter(this, void 0, void 0, function* () {
    if (!keyFile) {
        keyFile = yield exports.getKeyFilePath();
    }
    if (!keyFile) {
        task_1.failed('keyfile path was not provided');
        return null;
    }
    if (!path_1.default.isAbsolute(keyFile)) {
        keyFile = path_1.default.join(process.cwd(), keyFile);
    }
    if (!fs.existsSync(keyFile)) {
        task_1.failed('keyfile does not exist');
        return;
    }
    fileName = fileName || path_1.default.basename(keyFile);
    const questionKeyPassword = {
        type: 'password',
        name: 'keyFilePassword',
        message: `Enter password to unlock "${fileName}"`
    };
    const { keyFilePassword } = yield enquirer_1.prompt(questionKeyPassword);
    try {
        task_1.startTask('Unlocking keyfile');
        // @ts-ignore
        const privateKey = yield util_1.getPrivateKeyFromKeystore(keyFile, keyFilePassword);
        task_1.succeed('Keyfile unlocked');
        return privateKey;
    }
    catch (error) {
        task_1.failed('Key could not be unlocked: wrong password?');
    }
});
//# sourceMappingURL=EthKeystore.js.map