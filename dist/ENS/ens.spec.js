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
const chai_1 = require("chai");
const ens_1 = require("./ens");
describe('ENS', () => {
    describe('resolve', () => {
        it('resolves philipplgh.eth ', () => __awaiter(void 0, void 0, void 0, function* () {
            const address = yield ens_1.resolveName('philipplgh.eth');
            chai_1.assert.equal(address, '0x6efeF34e81FD201EdF18C7902948168E9eBb88aE');
        }));
        it('resolves ethpkg.eth ', () => __awaiter(void 0, void 0, void 0, function* () {
            const address = yield ens_1.resolveName('ethpkg.eth');
            chai_1.assert.equal(address, '0x6efeF34e81FD201EdF18C7902948168E9eBb88aE');
        }));
        it('resolves grid.philipplgh.eth ', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const address = yield ens_1.resolveName('grid.philipplgh.eth');
            chai_1.assert.equal((_a = address) === null || _a === void 0 ? void 0 : _a.toLowerCase(), '0x39830fed4b4b17fcdfa0830f9ab9ed8a1d0c11d9');
        }));
    });
    describe('lookup', () => {
    });
});
//# sourceMappingURL=ens.spec.js.map