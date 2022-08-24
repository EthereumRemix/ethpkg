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
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const secp256k1 = require('secp256k1');
const asn1 = require('asn1.js');
exports.isValidPemKeyfile = (keyfilePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let privateKey = yield getPrivateKeyFromPEM(keyfilePath);
        return privateKey !== undefined;
    }
    catch (error) {
        // catch asn / der parser exceptions
        return false;
    }
});
const getPrivateKeyFromPEM = (keyfilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const dearmor = (str) => {
        /**
         * handle
        -----BEGIN EC PARAMETERS-----
        BgUrgQQACg==
        -----END EC PARAMETERS-----
        -----BEGIN EC PRIVATE KEY-----
        MHQCAQEEIGmUEA1rRoaDkaO5CN7ycmobPYXDc2djcRRrmq1IBZ7CoAcGBSuBBAAK
        oUQDQgAE7FfkljPwW90lIHilxckicNZUDGACRDpnQCHth1+bUS7M50gqZAhkHfl+
        js17MSsy5zE0VhxFTOiZiVhW+MZCPQ==
        -----END EC PRIVATE KEY-----
         */
        const BEGIN_ARMOR = '-----BEGIN EC PRIVATE KEY-----';
        str = str.substring(str.lastIndexOf(BEGIN_ARMOR) + BEGIN_ARMOR.length, str.lastIndexOf('-----END EC PRIVATE KEY-----'));
        return str.split('\n').map(l => l.replace(/\s/g, '')).filter(l => !l.startsWith('-----')).join('');
    };
    if (!fs_1.default.existsSync(keyfilePath)) {
        return undefined;
    }
    const armoredKey = fs_1.default.readFileSync(keyfilePath, 'utf8');
    const privKeyStr = dearmor(armoredKey);
    const privKeyObjectDER = Buffer.from(privKeyStr, 'base64');
    // https://tools.ietf.org/html/rfc5915
    /*
    ECPrivateKey ::= SEQUENCE {
      version        INTEGER { ecPrivkeyVer1(1) } (ecPrivkeyVer1),
      privateKey     OCTET STRING,
      parameters [0] ECParameters {{ NamedCurve }} OPTIONAL,
      publicKey  [1] BIT STRING OPTIONAL
    }
    */
    const ECPrivateKey = asn1.define('ECPrivateKey', function () {
        this.seq().obj(this.key('version').int(), this.key('privateKey').octstr(), this.key('parameters').explicit(0).optional().objid(), this.key('publicKey').explicit(1).optional().bitstr());
    });
    const result = ECPrivateKey.decode(privKeyObjectDER, 'der');
    if (!result) {
        // console.log('keyfile parser error')
        return undefined;
    }
    const { privateKey } = result;
    const verified = secp256k1.privateKeyVerify(privateKey);
    if (!verified) {
        // console.log('invalid private key')
        return undefined;
    }
    return privateKey;
});
/*
export const getPrivateKey = async (keyfilePathOrAlias: string, passwordOrKeyStore?: string, password?: string) : Promise<Buffer> => {
  const _isKeyStoreFile = await isValidKeyStoreFile(keyfilePathOrAlias, passwordOrKeyStore)
  if (_isKeyStoreFile) {
    const pw = password || passwordOrKeyStore
    if (!pw) {
      throw new Error('No password provided')
    }
    const keyfilePath = await findKeyStoreFile(keyfilePathOrAlias, passwordOrKeyStore)
    return getPrivateKeyFromKeyfile(<string>keyfilePath, pw)
  }

  const _isPemFile = await isValidPemKeyfile(keyfilePathOrAlias)
  if (_isPemFile) {
    const pk = await getPrivateKeyFromPEM(keyfilePathOrAlias)
    if (pk === undefined) {
      throw new Error('Private key could not be parsed from PEM file')
    }
    return pk
  }

  throw new Error('Keyfile not found or not a valid Ethereum or PEM file')
}
*/
//# sourceMappingURL=KeyStoreUtils.js.map