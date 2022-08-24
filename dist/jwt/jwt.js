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
const JWS = __importStar(require("../jws"));
exports.sign = (payload, secretOrPrivateKey /*Secret*/, options) => __awaiter(void 0, void 0, void 0, function* () {
    const header = {}; // construct from options
    return JWS.sign(payload, secretOrPrivateKey, header);
});
/**
 * Asynchronously verify given token using a secret or a public key to get a decoded token
 * token - JWT string to verify
 * secretOrPublicKey - Either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA.
 * [options] - Options for the verification
 * returns - The decoded token.
 */
exports.verify = (token, // | IFlattenedJwsSerialization,
secretOrPublicKey, options) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO verify algorithms
    // TODO verify exp
    // TODO verify nbf
    // TODO verify issuer
    return '';
});
exports.decode = (token) => {
    return token.payload;
};
//# sourceMappingURL=jwt.js.map