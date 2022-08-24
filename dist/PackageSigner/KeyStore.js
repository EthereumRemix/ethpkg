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
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const IStateListener_1 = require("../IStateListener");
const util_1 = require("../util");
const ethers_1 = require("ethers");
const SUPPORTED_KEYFILE_VERSIONS = [3, 'ethpkg-3'];
const getKeyStorePath = () => {
    // TODO support different network IDs
    const dataDir = util_1.getDefaultDataDir().replace('~', os_1.default.homedir());
    const keystore = path_1.default.join(dataDir, 'keystore');
    return keystore;
};
/**
 * Generate filename for a keystore file.
 * @param {string} address Ethereum address.
 * @return {string} Keystore filename.
 */
const generateKeystoreFilename = (address) => {
    var filename = `ethpkg--UTC--${new Date().toISOString().split(':').join('-')}--${address}`;
    // Windows does not permit ":" in filenames, replace all with "-"
    if (process.platform === 'win32')
        filename = filename.split(':').join('-');
    return filename;
};
const ETHPKG_KEYFILE_VERSION = 'ethpkg-3';
exports.getPrivateKeyFromKeyfile = (keyfilePath, password) => __awaiter(void 0, void 0, void 0, function* () {
    let w;
    try {
        w = JSON.parse(fs_1.default.readFileSync(keyfilePath, 'utf8'));
        if ('alias' in w) {
            delete w.alias;
        }
        if (w.version === ETHPKG_KEYFILE_VERSION) {
            w.version = 3;
        }
    }
    catch (error) {
        throw new Error('Key cannot be parsed');
    }
    const wallet = yield ethers_1.Wallet.fromEncryptedJson(JSON.stringify(w), password);
    const pk = wallet.privateKey;
    return pk;
});
exports.getPassword = (password, key) => __awaiter(void 0, void 0, void 0, function* () {
    let keyName = key ? key.address : '';
    if (key && key.alias && key.alias.length > 0) {
        keyName = `"${key.alias.join(' | ')}"`;
    }
    if (!password) {
        throw new Error('No password provided to de/encrypt key');
    }
    if (typeof password === 'function') {
        password = yield password({ keyName });
        if (!password) {
            throw new Error('Password callback returned an empty or invalid password');
        }
        return password;
    }
    else {
        return password;
    }
});
class KeyStore {
    constructor(keystorePath) {
        this.keystorePath = keystorePath || getKeyStorePath();
    }
    listKeys(filterEthpkgKeys = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const keystore = this.keystorePath;
            // TODO we could filter keys here for e.g. a prefix like 'ethpkg' to avoid misuse
            const keys = fs_1.default.readdirSync(keystore).map((fileName) => {
                const filePath = path_1.default.join(keystore, fileName);
                try {
                    const stat = fs_1.default.statSync(filePath);
                    const keyObj = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
                    const { address, alias, version } = keyObj;
                    const isValid = SUPPORTED_KEYFILE_VERSIONS.includes(version);
                    return {
                        filePath,
                        fileName,
                        created: stat.birthtime,
                        address,
                        alias,
                        version,
                        keyObj,
                        isValid
                    };
                }
                catch (error) {
                    return {
                        filePath,
                        fileName,
                        keyObj: undefined,
                        isValid: false,
                        error
                    };
                }
            });
            let validKeyFiles = keys.filter(k => k.isValid);
            if (filterEthpkgKeys) {
                validKeyFiles = validKeyFiles.filter(k => k.alias && k.version === ETHPKG_KEYFILE_VERSION);
            }
            return validKeyFiles;
        });
    }
    hasKey(keyInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = yield this.listKeys();
            const k = keys.find(k => k.fileName == keyInfo || k.filePath === keyInfo || k.address === keyInfo || (Array.isArray(k.alias) && k.alias.includes(keyInfo)));
            return k !== undefined;
        });
    }
    getKeyByAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = yield this.listKeys();
            const selectedKey = keys.find(k => k.address === address);
            return selectedKey;
        });
    }
    getKeyByAlias(alias) {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = yield this.listKeys();
            const aliasKeys = keys.filter(k => { var _a; return (k.alias && k.alias.includes(alias)) || k.fileName === alias || ((_a = k.address) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === alias.toLowerCase(); });
            return aliasKeys;
        });
    }
    static isKeyfile(keyPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = path_1.default.dirname(keyPath);
            const _keytore = new KeyStore(p);
            return _keytore.hasKey(path_1.default.basename(keyPath));
        });
    }
    // TODO warn user if they want to sign with a non-dedicated signing key
    getKey({ password = undefined, listener = () => { }, alias = undefined, create = false, selectKeyCallback = undefined } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let keys = yield this.listKeys();
            // if user has no keys (in keystore) -> create new key
            if (create && keys.length === 0) {
                // TODO use listener
                console.log('Creating a new key');
                const { info, key } = yield this.createKey({
                    alias,
                    password,
                    listener
                });
                // TODO allow user to backup key
                let privateKey = key.getPrivateKey();
                return privateKey;
            }
            // search by alias
            if (alias) {
                listener(IStateListener_1.PROCESS_STATES.FINDING_KEY_BY_ALIAS_STARTED, { alias });
                keys = yield this.getKeyByAlias(alias);
                // TODO fix key: matchingKeys[0]
                if (keys.length === 0) {
                    throw new Error(`Key not found for alias: "${alias}"`);
                }
                else {
                    listener(IStateListener_1.PROCESS_STATES.FINDING_KEY_BY_ALIAS_FINISHED, { alias, key: keys[0] });
                }
            }
            let selectedKey = undefined;
            if (keys.length === 1) {
                selectedKey = keys[0];
            }
            else if (keys.length > 1) {
                // try to use any key that has an alias if it is only one
                const keysWithAlias = keys.filter(k => k.alias !== undefined);
                if (keysWithAlias.length === 1) {
                    selectedKey = keysWithAlias[0];
                }
            }
            if (!selectedKey && keys.length > 1) {
                if (typeof selectKeyCallback !== 'function') {
                    throw new Error('Ambiguous signing keys and no select callback or alias provided');
                }
                selectedKey = yield selectKeyCallback(keys);
                if (!selectedKey) {
                    throw new Error('Ambiguous signing keys and no select callback or alias provided');
                }
            }
            password = yield exports.getPassword(password, selectedKey);
            const unlockedKey = yield this.unlockKey(selectedKey, password, listener);
            return Buffer.from(unlockedKey.slice(2), 'hex');
        });
    }
    unlockKey(addressOrKey, password, listener = () => { }) {
        return __awaiter(this, void 0, void 0, function* () {
            let key;
            if (typeof addressOrKey === 'string') {
                key = yield this.getKeyByAddress(addressOrKey);
            }
            else {
                key = addressOrKey;
            }
            if (!key) {
                throw new Error(`Key not found: ${addressOrKey}`);
            }
            listener(IStateListener_1.PROCESS_STATES.UNLOCKING_KEY_STARTED, Object.assign({}, key));
            // FIXME find better way to offload unlock from main thread
            yield util_1.sleep(200); // allow listener to render
            const pk = yield exports.getPrivateKeyFromKeyfile(key.filePath, password);
            listener(IStateListener_1.PROCESS_STATES.UNLOCKING_KEY_FINISHED, Object.assign({}, key));
            return pk;
        });
    }
    createKey({ password = undefined, alias = 'ethpkg', listener = () => { } } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // handle invalid passwords, password callbacks etc
            password = yield exports.getPassword(password);
            listener(IStateListener_1.PROCESS_STATES.CREATE_SIGNING_KEY_STARTED, { alias });
            const key = ethers_1.Wallet.createRandom();
            const jsonString = yield key.encrypt(password);
            const json = JSON.parse(jsonString);
            json.version = ETHPKG_KEYFILE_VERSION;
            json.alias = [alias];
            const address = key.address;
            const fileName = generateKeystoreFilename(address);
            const filePath = path_1.default.join(this.keystorePath, fileName);
            fs_1.default.writeFileSync(filePath, JSON.stringify(json, null, 2));
            listener(IStateListener_1.PROCESS_STATES.CREATE_SIGNING_KEY_FINISHED, { alias, keyPath: filePath });
            return {
                key,
                info: {
                    address,
                    fileName,
                    filePath,
                    isValid: true
                }
            };
        });
    }
}
exports.default = KeyStore;
//# sourceMappingURL=KeyStore.js.map