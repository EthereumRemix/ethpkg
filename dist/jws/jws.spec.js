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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const jws_1 = require("./jws");
const GethSigner_1 = __importDefault(require("../Signers/GethSigner"));
const PrivateKeySigner_1 = __importDefault(require("../Signers/PrivateKeySigner"));
const ethUtil = __importStar(require("ethereumjs-util"));
const PRIVATE_KEY_1 = Buffer.from('62DEBF78D596673BCE224A85A90DA5AECF6E781D9AADCAEDD4F65586CFE670D2', 'hex');
const ETH_ADDRESS_1 = '0xF863aC227B0a0BCA88Cb2Ff45d91632626CE32e7';
const SIGNED_FOO_PAYLOAD_DATA = {
    sha512: {
        './foo/foo.txt': 'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7',
        './foo/bar.txt': 'd82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181'
    }
};
const SIGNED_FOO_PAYLOAD = {
    version: 1,
    iss: 'self',
    exp: 1577456540302,
    data: SIGNED_FOO_PAYLOAD_DATA
};
// has different order of keys and different structure (whitespaces, linebreaks)
const SIGNED_FOO_PAYLOAD_ORDER = { iss: 'self', version: 1, exp: 1577456540302, data: SIGNED_FOO_PAYLOAD_DATA };
const SIGNED_FOO_PAYLOAD_TS_DIFF = {
    version: 1,
    iss: 'self',
    exp: 1577456540309,
    data: SIGNED_FOO_PAYLOAD_DATA
};
const SIGNED_FOO_PAYLOAD_DATA_DIFF = {
    version: 1,
    iss: 'self',
    exp: 1577456540302,
    data: 'hello world' // data differs
};
const SIGNED_FOO_HEADER = 'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdLCJqd2siOnsia3R5IjoiRUMiLCJrZXlfb3BzIjpbInNpZ24iLCJ2ZXJpZnkiXSwiY3J2IjoiUC0yNTZLIiwiZXRoIjp7ImFkZHJlc3MiOiIweGY4NjNhYzIyN2IwYTBiY2E4OGNiMmZmNDVkOTE2MzI2MjZjZTMyZTcifX0sInR5cCI6IkpXVCJ9';
const SIGNED_FOO_SIGNATURE = Buffer.from('ce5488f80e17b53517580729aed723eaa3f5f2c9700fb3ecdf2686adaed7947925f8708677775b87e0966f331e1b620b781ccb16d82def94537028d00f52201b1b', 'hex');
const SIGNED_FOO_MSG = `${SIGNED_FOO_HEADER}.${jws_1.safeStringify(SIGNED_FOO_PAYLOAD)}`;
/**
eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdLCJqd2siOnsia3R5IjoiRUMiLCJrZXlfb3BzIjpbInNpZ24iLCJ2ZXJpZnkiXSwiY3J2IjoiUC0yNTZLIiwiZXRoIjp7ImFkZHJlc3MiOiJmODYzYWMyMjdiMGEwYmNhODhjYjJmZjQ1ZDkxNjMyNjI2Y2UzMmU3In19LCJ0eXAiOiJKV1QifQ.{"data":{"sha512":{"./foo/foo.txt":"f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7","./foo/bar.txt":"d82c4eb5261cb9c8aa9855edd67d1bd10482f41529858d925094d173fa662aa91ff39bc5b188615273484021dfb16fd8284cf684ccf0fc795be3aa2fc1e6c181"}},"exp":1577456540302,"iss":"self","version":1}
 */
// difference between jws and jwt:
// the payload of a jws can be anything
// if the payload is a json object describing CLAIMS aka "Claims Set" we speak of a jwt 
describe('JWS', () => {
    describe('fixture integrity', () => {
        it('makes sure that fixture data is correct', () => __awaiter(void 0, void 0, void 0, function* () {
            const token = yield jws_1.sign(SIGNED_FOO_PAYLOAD, PRIVATE_KEY_1);
            const decoded = yield jws_1.decode(token);
            chai_1.assert.equal(SIGNED_FOO_HEADER, token.protected);
            chai_1.assert.equal(SIGNED_FOO_SIGNATURE.toString('hex'), decoded.signature);
            // TODO check signing input
        }));
    });
    describe('sign = async (payload: any, signerOrPrivateKey: Buffer | ISigner, header? : any)', function () {
        it('signs a payload with alg=ES256K (default) using a private key and returns a jws object', () => __awaiter(this, void 0, void 0, function* () {
            const token = yield jws_1.sign(SIGNED_FOO_PAYLOAD, PRIVATE_KEY_1);
            chai_1.assert.isDefined(token.signature);
            const decoded = yield jws_1.verify(token);
            chai_1.assert.equal(decoded.signature, SIGNED_FOO_SIGNATURE.toString('hex'));
        }));
        it('the protected JOSE header contains the signer\'s ethereum address in the jwk.eth.address field', () => __awaiter(this, void 0, void 0, function* () {
            const token = yield jws_1.sign(SIGNED_FOO_PAYLOAD, PRIVATE_KEY_1);
            chai_1.assert.isDefined(token.signature);
            const decoded = yield jws_1.verify(token);
            const { header } = decoded;
            chai_1.assert.isDefined(header.jwk);
            chai_1.assert.isDefined(header.jwk.eth);
            chai_1.assert.isDefined(header.jwk.eth.address);
            chai_1.assert.equal(header.jwk.eth.address.toLowerCase(), ETH_ADDRESS_1.toLowerCase());
        }));
        it('different metadata payload values result in different signatures', () => __awaiter(this, void 0, void 0, function* () {
            const token1 = yield jws_1.sign(SIGNED_FOO_PAYLOAD, PRIVATE_KEY_1);
            const token2 = yield jws_1.sign(SIGNED_FOO_PAYLOAD_TS_DIFF, PRIVATE_KEY_1);
            chai_1.assert.notEqual(token1.signature, token2.signature);
        }));
        it('different payload data values result in different signatures', () => __awaiter(this, void 0, void 0, function* () {
            const token1 = yield jws_1.sign(SIGNED_FOO_PAYLOAD, PRIVATE_KEY_1);
            const token2 = yield jws_1.sign(SIGNED_FOO_PAYLOAD_DATA_DIFF, PRIVATE_KEY_1);
            chai_1.assert.notEqual(token1.signature, token2.signature);
        }));
        it('is robust against different order of payload fields', () => __awaiter(this, void 0, void 0, function* () {
            const token1 = yield jws_1.sign(SIGNED_FOO_PAYLOAD, PRIVATE_KEY_1);
            const token2 = yield jws_1.sign(SIGNED_FOO_PAYLOAD_ORDER, PRIVATE_KEY_1);
            chai_1.assert.equal(token1.signature, token2.signature);
        }));
        it('is robust against different order of header fields', () => __awaiter(this, void 0, void 0, function* () {
            const header = jws_1.createHeader({
                algorithm: jws_1.ALGORITHMS.ETH_SIGN,
                address: ETH_ADDRESS_1
            });
            const headerInv = {};
            Object.keys(header).reverse().forEach(k => headerInv[k] = header[k]);
            const token1 = yield jws_1.sign(SIGNED_FOO_PAYLOAD, PRIVATE_KEY_1, header);
            const token2 = yield jws_1.sign(SIGNED_FOO_PAYLOAD_ORDER, PRIVATE_KEY_1, headerInv);
            chai_1.assert.equal(token1.signature, token2.signature);
        }));
        it('does not support signing schemes other than "EC_SIGN" and "ETH_SIGN"', () => __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.throws(function () {
                const header = jws_1.createHeader({
                    algorithm: 'HS256',
                    address: ETH_ADDRESS_1
                });
                return jws_1.sign(SIGNED_FOO_PAYLOAD, PRIVATE_KEY_1, header);
            });
        }));
        it('signs a payload using ethereum\'s personal message signing', () => __awaiter(this, void 0, void 0, function* () {
            const header = jws_1.createHeader({
                algorithm: jws_1.ALGORITHMS.ETH_SIGN,
                address: ETH_ADDRESS_1
            });
            const token = yield jws_1.sign(SIGNED_FOO_PAYLOAD_ORDER, PRIVATE_KEY_1, header);
            chai_1.assert.isDefined(token.signature);
        }));
        // TODO use grid-core http api to setup geth
        // ./geth --syncmode light --unlock 0xf863ac227b0a0bca88cb2ff45d91632626ce32e7 --password <(echo test) --rpc --rpccorsdomain=localhost --port 0 --allow-insecure-unlock
        it.skip('signs a payload using geth as an external signer with personal message signing', () => __awaiter(this, void 0, void 0, function* () {
            const header = jws_1.createHeader({
                algorithm: jws_1.ALGORITHMS.ETH_SIGN,
                address: ETH_ADDRESS_1
            });
            const signer = new GethSigner_1.default(ETH_ADDRESS_1);
            const token = yield jws_1.sign(SIGNED_FOO_PAYLOAD, signer, header);
            chai_1.assert.isDefined(token.signature);
        }));
    });
    describe('ecRecover = async (rpcSig: string, msg: string) : Promise<string>', function () {
        it('returns the ethereum address from an "rpc"-signature', () => __awaiter(this, void 0, void 0, function* () {
            const msg = 'hello';
            const signer = new PrivateKeySigner_1.default(PRIVATE_KEY_1);
            const signature = yield signer.ecSign(Buffer.from(msg));
            const address = yield jws_1.ecRecover(signature.toString('hex'), msg);
            chai_1.assert.equal(address.toString().toLowerCase(), ETH_ADDRESS_1.toLowerCase());
        }));
        it('returns the ethereum address from an "rpc"-signature #2', () => __awaiter(this, void 0, void 0, function* () {
            const token = yield jws_1.sign(SIGNED_FOO_PAYLOAD, PRIVATE_KEY_1);
            const decoded = yield jws_1.decode(token);
            const address = yield jws_1.ecRecover(decoded.signature, SIGNED_FOO_MSG);
            chai_1.assert.equal(address.toString().toLowerCase(), ETH_ADDRESS_1.toLowerCase());
        }));
        it('returns the ethereum address from an "rpc"-signature #3', () => __awaiter(this, void 0, void 0, function* () {
            const address = yield jws_1.ecRecover(SIGNED_FOO_SIGNATURE.toString('hex'), SIGNED_FOO_MSG);
            chai_1.assert.equal(address.toString().toLowerCase(), ETH_ADDRESS_1.toLowerCase());
        }));
        it.skip('returns the ethereum address from an "ec compact"-signature', () => __awaiter(this, void 0, void 0, function* () {
            // TODO needs implementation
        }));
        it('WARNING: returns a random ethereum address from a personal message "rpc"-signature when used with different message input', () => __awaiter(this, void 0, void 0, function* () {
            const msg = 'hello';
            const bad_msg = 'foo';
            const signer = new PrivateKeySigner_1.default(PRIVATE_KEY_1);
            const signature = yield signer.ecSign(Buffer.from(msg));
            const badAddress = yield jws_1.ecRecover(signature.toString('hex'), bad_msg);
            chai_1.assert.isTrue(ethUtil.isValidAddress(badAddress));
            chai_1.assert.notEqual(badAddress.toString().toLowerCase(), ETH_ADDRESS_1.toLowerCase());
        }));
        it('WARNING: returns a random ethereum address from a ECDSA "rpc"-signature when used with different message input', () => __awaiter(this, void 0, void 0, function* () {
            const msg = 'hello';
            const bad_msg = 'foo';
            const signer = new PrivateKeySigner_1.default(PRIVATE_KEY_1);
            const signature = yield signer.ethSign(Buffer.from(msg));
            const badAddress = yield jws_1.ecRecover(signature.toString('hex'), bad_msg, jws_1.ALGORITHMS.ETH_SIGN);
            chai_1.assert.isTrue(ethUtil.isValidAddress(badAddress));
            chai_1.assert.notEqual(badAddress.toString().toLowerCase(), ETH_ADDRESS_1.toLowerCase());
        }));
        it('WARNING: returns a random ethereum address if the wrong signature scheme is used during recovery', () => __awaiter(this, void 0, void 0, function* () {
            const msg = 'hello';
            const bad_msg = 'foo';
            const signer = new PrivateKeySigner_1.default(PRIVATE_KEY_1);
            // note ecSign used for signing
            const signature = yield signer.ecSign(Buffer.from(msg));
            // and ETH_SIGN for recovery
            const badAddress = yield jws_1.ecRecover(signature.toString('hex'), bad_msg, jws_1.ALGORITHMS.ETH_SIGN);
            chai_1.assert.isTrue(ethUtil.isValidAddress(badAddress));
            chai_1.assert.notEqual(badAddress.toString().toLowerCase(), ETH_ADDRESS_1.toLowerCase());
        }));
        it('returns the ethereum address from an "eth personal message"-signature', () => __awaiter(this, void 0, void 0, function* () {
            const msg = 'hello world';
            const signer = new PrivateKeySigner_1.default(PRIVATE_KEY_1);
            const signature = yield signer.ethSign(Buffer.from(msg));
            const address = yield jws_1.ecRecover(signature.toString('hex'), msg, jws_1.ALGORITHMS.ETH_SIGN);
            chai_1.assert.equal(address.toString().toLowerCase(), ETH_ADDRESS_1.toLowerCase());
        }));
    });
    describe('verify = async (token: string | IFlattenedJwsSerialization, secretOrPublicKey: string | Buffer, options?: VerifyOptions): Promise<IFlattenedJwsSerialization>', function () {
        it('verifies a jws "token" with ES256K signature against an address', () => __awaiter(this, void 0, void 0, function* () {
            const token = yield jws_1.sign(SIGNED_FOO_PAYLOAD, PRIVATE_KEY_1);
            const decoded = yield jws_1.verify(token, ETH_ADDRESS_1);
            chai_1.assert.isDefined(decoded);
        }));
        it.skip('throws if the recovered address is not matching the jwk header value', () => {
        });
    });
});
//# sourceMappingURL=jws.spec.js.map