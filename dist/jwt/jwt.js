"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jws_1 = __importDefault(require("../jws"));
const sign = (payload, secretOrPrivateKey /*Secret*/, options) => __awaiter(this, void 0, void 0, function* () {
    const header = {}; // construct from options
    return jws_1.default.sign(payload, secretOrPrivateKey, header);
});
const verify = (token, secretOrPublicKey, options) => __awaiter(this, void 0, void 0, function* () {
    // TODO verify algorithms
    // TODO verify exp
    // TODO verify nbf
    // TODO verify issuer
    return '';
});
const decode = (token) => {
    return token.payload;
};
exports.default = { sign, verify, decode };
//# sourceMappingURL=jwt.js.map