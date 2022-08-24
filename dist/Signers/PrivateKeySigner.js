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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethUtil = __importStar(require("ethereumjs-util"));
// TODO make sure that private keys are not unneccesarily long kept in memory and/or that pk is not instance variable
class PrivateKeySigner {
    constructor(privateKey) {
        this.name = 'PrivateKeySigner';
        this.type = 'signer';
        if (!ethUtil.isValidPrivate(privateKey)) {
            throw new Error('Invalid private key');
        }
        this._privateKey = privateKey;
    }
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            return ethUtil.privateToAddress(this._privateKey).toString('hex');
        });
    }
    // NOTE: this signing scheme is quite dangerous as users can be tricked into signing transactions
    // however hardware modules that implement secp256k1 are unlikely to implement ethereum personal message signing
    // the rpc format is the "serialized" form of r,s,v that geth and other clients are using
    ecSign(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const msgHash = ethUtil.keccak256(msg);
            const signature = ethUtil.ecsign(msgHash, this._privateKey);
            // const signatureData = secp256k1.sign(msgHash, privateKey)
            // const { signature } = signatureData 
            // const r = signature.slice(0, 32)
            // const s = signature.slice(32, 64)
            // signature.v = signatureData.recovery // eth specific: + 27
            // console.log('signature', signature)
            // geth (and the RPC eth_sign method) uses the 65 byte format used by Bitcoin
            // bufferToHex(Buffer.concat([setLengthLeft(r, 32), setLengthLeft(s, 32), toBuffer(v)]))
            const rpcSig = ethUtil.toRpcSig(signature.v, signature.r, signature.s);
            return Buffer.from(rpcSig.slice(2), 'hex');
        });
    }
    // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
    ethSign(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const ethMsg = ethUtil.hashPersonalMessage(Buffer.from(msg));
            const signature = ethUtil.ecsign(ethMsg, this._privateKey);
            const rpcSig = ethUtil.toRpcSig(signature.v, signature.r, signature.s);
            const signatureBuf = Buffer.from(rpcSig.slice(2), 'hex');
            return signatureBuf;
        });
    }
}
exports.default = PrivateKeySigner;
//# sourceMappingURL=PrivateKeySigner.js.map