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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const stream_1 = __importDefault(require("stream"));
// import { prompt } from 'enquirer'
const keythereum = require('keythereum');
const secp256k1 = require('secp256k1');
const asn1 = require('asn1.js');
const getDefaultDataDir = () => {
    switch (process.platform) {
        case 'win32': return `${process.env.APPDATA}/Ethereum`;
        case 'linux': return '~/.ethereum';
        case 'darwin': return '~/Library/Ethereum';
        default: return '~/.ethereum';
    }
};
exports.getKeystorePath = () => {
    const dataDir = getDefaultDataDir().replace('~', os_1.default.homedir());
    const keystore = path_1.default.join(dataDir, 'keystore');
    return keystore;
};
exports.getPrivateKeyFromKeystore = (keyFile, keyFilePassword) => __awaiter(this, void 0, void 0, function* () {
    if (!path_1.default.isAbsolute(keyFile)) {
        const keystore = exports.getKeystorePath();
        // account referenced by address
        if (keyFile.startsWith('0x')) {
            let address = keyFile.substring(2); // remove 0x
            // TODO this is a weak and likely to break detection: looking insight json would be better
            let keyFileName = fs_1.default.readdirSync(keystore).find(file => file.endsWith(address));
            if (!keyFileName) {
                throw new Error(`keyfile for account ${keyFile} not found`);
            }
            keyFile = keyFileName;
        }
        // expand to full path
        keyFile = path_1.default.join(keystore, keyFile);
    }
    if (!keyFilePassword) {
        const questionKeyPassword = {
            type: 'password',
            name: 'password',
            message: `Enter password to unlock "${path_1.default.basename(keyFile)}"`
        };
        // FIXME breaks browser lib
        // const { password } = await prompt(questionKeyPassword)
        // keyFilePassword = password
        throw new Error("no password provided");
    }
    let keyObject;
    try {
        // good info when resolver used: console.log('use keyfile', keyFile)
        keyObject = JSON.parse(fs_1.default.readFileSync(keyFile, 'utf8'));
    }
    catch (error) {
        console.log('>> keyfile could not be accessed');
        return;
    }
    const privateKey = keythereum.recover(keyFilePassword, keyObject);
    return privateKey;
});
exports.getPrivateKeyFromPEM = (inputPath) => {
    const dearmor = (str) => {
        return str.split('\n').map(l => l.replace(/\s/g, "")).filter(l => !l.startsWith('-----')).join('');
    };
    const armoredKey = fs_1.default.readFileSync(inputPath, 'utf8');
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
        this.seq().obj(this.key('version').int(), this.key('privateKey').octstr(), this.key('parameters').explicit(0).optional().any(), this.key('publicKey').explicit(1).optional().bitstr());
    });
    const { result } = ECPrivateKey.decode(privKeyObjectDER, 'der');
    if (!result) {
        // console.log('keyfile parser error')
        return null;
    }
    const { privateKey } = result;
    const verified = secp256k1.privateKeyVerify(privateKey);
    if (!verified) {
        // console.log('invalid private key')
        return null;
    }
    return privateKey;
};
function runScriptSync(scriptName, scriptArgs, cwd) {
    const scriptCommand = `${scriptName} ${scriptArgs.join(' ')}`;
    const scriptOptions = {
        stdio: ['inherit', 'inherit', 'inherit'],
        // stdio: [null, null, null], // mute in and outputs
        encoding: 'UTF-8'
    };
    if (cwd) {
        // @ts-ignore
        scriptOptions.cwd = cwd;
    }
    try {
        const exec = require('child_process').execSync;
        const result = exec(scriptCommand, scriptOptions);
        return result;
    }
    catch (err) {
        console.log(`Error running ${scriptName}`, err);
    }
}
exports.runScriptSync = runScriptSync;
function runScript(scriptName, scriptArgs, cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        const scriptCommand = `${scriptName} ${scriptArgs.join(' ')}`;
        const scriptOptions = {
            stdio: [null, null, null],
            encoding: 'UTF-8'
        };
        if (cwd) {
            // @ts-ignore
            scriptOptions.cwd = cwd;
        }
        try {
            const util = require('util');
            const exec = util.promisify(require('child_process').exec);
            const { stdout } = yield exec(scriptCommand, scriptOptions);
            return stdout;
        }
        catch (err) {
            console.log(`Error running ${scriptName}`, err);
            Promise.reject();
        }
    });
}
exports.runScript = runScript;
exports.downloadNpmPackage = (moduleName) => __awaiter(this, void 0, void 0, function* () {
    try {
        let filename = yield runScript(`npm pack ${moduleName}`, []);
        filename = filename.trim(); // can contain lf,\n etc
        const filePathFull = path_1.default.join(process.cwd(), filename);
        return filePathFull;
    }
    catch (error) {
        return null;
    }
});
class WritableMemoryStream extends stream_1.default.Writable {
    constructor() {
        super();
        this.data = [];
        this.buffer = undefined;
        this.data = [];
        this.once('finish', () => {
            this.buffer = Buffer.concat(this.data);
        });
    }
    _write(chunk, enc, cb) {
        this.data.push(chunk);
        cb();
    }
}
exports.streamToBuffer = (stream, size) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        let mStream = new WritableMemoryStream();
        // let fStream = fs.createWriteStream(__dirname+'/test')
        let t0 = Date.now();
        stream.pipe(mStream);
        // stream.pipe(fStream)
        let completed = 0;
        stream.on('data', (data) => {
            completed += data.length;
            // console.log('data ', completed, '/', size)
        });
        stream.on("error", (error) => {
            reject(error);
        });
        stream.on('end', () => {
            // console.log( ((Date.now()-t0) / 1000) , ' finished processing')
            // console.log('end of stream', completed, '/',  size)
            // TODO make sure that buffer also contains bytes stream.end vs mStream.end
            resolve(mStream.buffer);
        });
    });
});
exports.bufferToStream = (buf) => {
    const readable = new stream_1.default.Readable();
    readable._read = () => { }; // _read is required but you can noop it
    readable.push(buf);
    readable.push(null);
    return readable;
};
//# sourceMappingURL=util.js.map