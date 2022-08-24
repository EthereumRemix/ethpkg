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
const Downloader_1 = require("../Downloader");
/**
 * WARNING: Use of the Geth signer to sign packages is discouraged!
 * This is mainly used for testing & to be able to compare the results of different client implementations
 */
class GethSigner {
    // Note that unlock + http api results in *Error: account unlock with HTTP access is forbidden* for a good reason
    // and needs to be explicitly allowed with '--allow-insecure-unlock'
    constructor(address, rpc = 'http://localhost:8545') {
        this.name = 'Geth';
        this.type = 'signer';
        this.id = 0;
        // Note the address to sign with must be unlocked.
        this.address = address;
        this.rpcApi = rpc;
        console.log('WARNING: Use of the Geth signer is discouraged -> it should only be used for testing');
    }
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.address;
        });
    }
    ecSign(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Unsupported Operation');
        });
    }
    ethSign(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
            const rpcData = {
                'jsonrpc': '2.0',
                'method': 'eth_sign',
                'params': [this.address, ('0x' + msg.toString('hex'))],
                'id': ++this.id
            };
            const response = yield Downloader_1.request('POST', this.rpcApi, {
                headers: {
                    'Content-Type': 'application/json',
                },
                Body: rpcData
            });
            const dataBuf = yield Downloader_1.downloadStreamToBuffer(response);
            const data = JSON.parse(dataBuf.toString());
            const { result } = data;
            return Buffer.from(result.slice(2), 'hex');
        });
    }
}
exports.default = GethSigner;
//# sourceMappingURL=GethSigner.js.map