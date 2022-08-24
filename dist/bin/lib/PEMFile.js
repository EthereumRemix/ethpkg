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
const InputFilepath_1 = require("./InputFilepath");
const util_1 = require("../../util");
exports.getPrivateKeyFromPemFile = () => __awaiter(this, void 0, void 0, function* () {
    const keyFilePath = yield InputFilepath_1.getUserFilePath('Provide path to pem keyfile');
    const privateKey = util_1.getPrivateKeyFromPEM(keyFilePath);
    return privateKey;
});
//# sourceMappingURL=PEMFile.js.map