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
const crypto_1 = __importDefault(require("crypto"));
const ICertificate_1 = require("./ICertificate");
const jwt_1 = __importDefault(require("./jwt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ethereumjs_util_1 = __importDefault(require("ethereumjs-util"));
const uuid = () => crypto_1.default.randomBytes(16).toString('hex');
const DAYS = 14; // 14 days is max -> short-lived
const SECONDS_PER_DAY = 86400; // 24 * 60 * 60
const now = () => {
    return Math.floor(Date.now() / 1000);
};
const setJwtStandardClaims = (payload, iss, address) => {
    return Object.assign({}, payload, { 
        // issuer block:
        iss, 
        // subject block:
        sub: address, 
        // validity block:
        iat: now(), exp: now() + (DAYS * SECONDS_PER_DAY), nbf: now(), jti: uuid() });
};
const flattenKeyInfo = (SubjectPublicKeyInfo) => {
    return {
        'key:alg': SubjectPublicKeyInfo.alg,
        'key:address': SubjectPublicKeyInfo.address
    };
};
const signAlt = (payload) => {
    return jsonwebtoken_1.default.sign(payload, '1234');
};
class cert {
    static csr(SubjectIdentityInfo, privateKey, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = '0x' + ethereumjs_util_1.default.privateToAddress(privateKey).toString('hex');
            const SubjectPublicKeyInfo = {
                alg: 'eth',
                address
            };
            const payload = Object.assign({}, (flattenKeyInfo(SubjectPublicKeyInfo)), SubjectIdentityInfo);
            const payloadJwt = setJwtStandardClaims(payload, address, address);
            return yield jwt_1.default.sign(payloadJwt, privateKey);
            // return _jwt.decode(signAlt(payload))
        });
    }
    static issue(validatedCsr, privateKey, optionsHeader, ca = {
        iss: 'self'
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            const csrPayload = yield jwt_1.default.decode(validatedCsr);
            // 2. extract address from csr
            const { SubjectPublicKeyInfo, SubjectIdentityInfo } = csrPayload;
            const { address } = SubjectPublicKeyInfo;
            const { name, email } = SubjectIdentityInfo;
            // 4. create cert token
            let payload = {
                // versioning / "header" block:
                version: 1,
                'cert:typ': ICertificate_1.CERT_TYPE.PUBLIC_KEY,
                'id:typ': ICertificate_1.IDENTITY_TYPE.EMAIL,
                // subject data block:
                csr: validatedCsr,
                name,
                email,
                // key block
                "key:alg": 'eth',
                "key:address": address
            };
            payload = setJwtStandardClaims(payload, 'self', address);
            // return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
            return yield jwt_1.default.sign(payload, privateKey);
        });
    }
}
exports.default = cert;
//# sourceMappingURL=cert.js.map