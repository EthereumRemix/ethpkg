"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid = () => crypto_1.default.randomBytes(16).toString('hex');
const DAYS = 14; // 14 days is max -> short-lived
const SECONDS_PER_DAY = 86400; // 24 * 60 * 60
const now = () => {
    return Math.floor(Date.now() / 1000);
};
const setJwtStandardClaims = (payload, iss, address) => {
    return Object.assign(Object.assign({}, payload), { 
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
/*
export default class cert {

  static async csr(SubjectIdentityInfo: ISubjectInfo, privateKey: Buffer, options : ICsrOptions): Promise<IFlattenedJwsSerialization | string | object | null> {
    const address = '0x'+ethUtil.privateToAddress(privateKey).toString('hex')
    const SubjectPublicKeyInfo = {
      alg: 'eth',
      address
    }
    const payload = {
      ...(flattenKeyInfo(SubjectPublicKeyInfo)),
      ...SubjectIdentityInfo
    }
    const payloadJwt = setJwtStandardClaims(payload, address, address)
    return await jwt.sign(payloadJwt, privateKey)
    // return _jwt.decode(signAlt(payload))
  }

  static async issue(
    validatedCsr: ICertificateSigningRequest,
    privateKey: Buffer,
    optionsHeader: any,
    ca = {
      iss: 'self'
    }
  ): Promise<IFlattenedJwsSerialization> {

    const csrPayload = await jwt.decode(validatedCsr)

    // 2. extract address from csr
    const { SubjectPublicKeyInfo, SubjectIdentityInfo } = csrPayload
    const { address } = SubjectPublicKeyInfo
    const { name, email } = SubjectIdentityInfo
    // 4. create cert token

    let payload = {
      // versioning / "header" block:
      version: 1,
      'cert:typ': CERT_TYPE.PUBLIC_KEY, // custom: oneOf CERT_TYPE
      'id:typ': IDENTITY_TYPE.EMAIL, // custom: oneOf IDENTITY_TYPE

      // subject data block:
      csr: validatedCsr,

      name,
      email,

      // key block
      "key:alg": 'eth',
      "key:address": address
    }

    payload = setJwtStandardClaims(payload, 'self', address)

    // return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    return await jwt.sign(payload, privateKey)
  }
}
*/ 
//# sourceMappingURL=cert.js.map