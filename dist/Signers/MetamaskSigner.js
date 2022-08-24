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
const connect = () => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof ethereum !== 'undefined') {
        return ethereum.enable()
            .catch(console.error);
    }
    throw new Error('Cannot connect to Metamask');
});
class MetamaskSigner {
    constructor() {
        this.name = 'Metamask';
        this.type = 'signer';
    }
    getAddress(retry = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let from = undefined;
            try {
                from = web3.eth.accounts[0];
            }
            catch (error) {
                // ignore .. not connected? try again once
            }
            if (!from) {
                yield connect();
                if (retry) {
                    return this.getAddress(false);
                }
            }
            return from;
        });
    }
    ecSign(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Unsupported Operation');
        });
    }
    metamaskEthSign(msg, from) {
        return __awaiter(this, void 0, void 0, function* () {
            const method = 'personal_sign';
            const params = [msg, from];
            try {
                const { result: signature } = yield new Promise((resolve, reject) => {
                    web3.currentProvider.sendAsync({ method, params, from }, function (err, data) {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(data);
                    });
                });
                return signature;
            }
            catch (error) {
                if (error && error.code === 4001) {
                    // user denied
                    console.log(error.message);
                    return undefined;
                }
                throw error;
            }
        });
    }
    ethSign(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = yield this.getAddress();
            const rpcSig = yield this.metamaskEthSign(msg.toString(), address);
            if (rpcSig) {
                return Buffer.from(rpcSig.slice(2), 'hex');
            }
            throw new Error('Could not sign');
        });
    }
}
exports.default = MetamaskSigner;
//# sourceMappingURL=MetamaskSigner.js.map