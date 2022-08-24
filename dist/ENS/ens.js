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
const ethers_1 = require("ethers");
const cache = {};
exports.resolveName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    if (name in cache) {
        return cache[name];
    }
    // TODO check env to return this only in tests
    if (name === 'foo.test.eth') {
        return '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7';
    }
    const provider = new ethers_1.ethers.providers.InfuraProvider();
    const address = yield provider.resolveName(name);
    cache[name] = address;
    return address;
});
exports.lookupName = (address) => __awaiter(void 0, void 0, void 0, function* () {
});
//# sourceMappingURL=ens.js.map