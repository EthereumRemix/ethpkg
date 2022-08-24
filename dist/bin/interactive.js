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
const path_1 = __importDefault(require("path"));
const enquirer_1 = require("enquirer");
exports.getUserFilePath = (message, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (filePath) {
        return filePath;
    }
    if (filePath && !path_1.default.isAbsolute(filePath)) {
        filePath = path_1.default.join(process.cwd(), filePath);
        return filePath;
    }
    const questionFile = (message) => [{
            type: 'input',
            name: 'file',
            message,
            initial: ''
        }];
    let { file } = yield enquirer_1.prompt(questionFile(message));
    return file;
});
exports.getCredentialsFromUser = ({} = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const questionUsername = (message = `Enter username`) => ({
        type: 'text',
        name: 'username',
        message
    });
    const { username } = yield enquirer_1.prompt(questionUsername());
    const questionPassword = (message = `Enter login password`) => ({
        type: 'password',
        name: 'password',
        message
    });
    const { password } = yield enquirer_1.prompt(questionPassword());
    if (!password) {
        throw new Error('Error: no password provided by user');
    }
    return {
        username,
        password
    };
});
exports.getPasswordFromUser = ({ repeat = false, keyName = '' } = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const questionKeyPassword = (message = `Enter password to de/encrypt key ${keyName}`) => ({
        type: 'password',
        name: 'password',
        message
    });
    const { password } = yield enquirer_1.prompt(questionKeyPassword());
    if (!password) {
        throw new Error('Error: no password provided by user');
    }
    if (repeat) {
        const { password: repeated } = yield enquirer_1.prompt(questionKeyPassword(`Repeat password to de/encrypt key`));
        if (password !== repeated) {
            throw new Error('Password input does not match.. typo?');
        }
    }
    return password;
});
exports.getSelectedKeyFromUser = (keys) => __awaiter(void 0, void 0, void 0, function* () {
    const question = [{
            type: 'select',
            name: 'selectedKey',
            message: `Which key do you want to use for signing and publishing?`,
            initial: '',
            choices: keys.map((k) => ({ name: k.address, message: `${k.address} ("${k.fileName}")`, keyFile: k.filePath, file: k.fileName })),
            result(value) {
                return keys.find((key) => key.address === value);
            }
        }];
    const { selectedKey } = yield enquirer_1.prompt(question);
    return selectedKey;
});
//# sourceMappingURL=interactive.js.map