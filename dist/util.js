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
const stream_1 = __importDefault(require("stream"));
// @ts-ignore
const xml2js_1 = require("xml2js");
const IStateListener_1 = require("./IStateListener");
const FilenameUtils_1 = require("./utils/FilenameUtils");
// https://github.com/ethereum/go-ethereum/wiki/Backup-&-restore#data-directory
exports.getDefaultDataDir = () => {
    switch (process.platform) {
        case 'win32': return `${process.env.APPDATA}/Ethereum`;
        case 'linux': return '~/.ethereum';
        case 'darwin': return '~/Library/Ethereum';
        default: return '~/.ethereum';
    }
};
function parseXml(xml) {
    return new Promise((resolve, reject) => {
        xml2js_1.parseString(xml, (err, result) => {
            if (err)
                return reject(err);
            resolve(result);
        });
    });
}
exports.parseXml = parseXml;
exports.formatBytes = (bytes) => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb > 1) {
        return `${mb.toFixed(2)} MB`;
    }
    return `${kb.toFixed(2)} KB`;
};
exports.isDirPath = (str) => !path_1.default.extname(str);
exports.isFilePath = (str) => str && !exports.isUrl(str) && (!!FilenameUtils_1.getExtension(str));
exports.isDirSync = (filePath) => {
    if (filePath === undefined) {
        return false;
    }
    try {
        const fileStats = fs_1.default.lstatSync(filePath);
        return fileStats.isDirectory() && !fileStats.isSymbolicLink();
    }
    catch (error) {
        return false;
    }
};
exports.isFileSync = (filePath) => {
    if (filePath === undefined) {
        return false;
    }
    try {
        const fileStats = fs_1.default.lstatSync(filePath);
        return fileStats.isFile && !fileStats.isSymbolicLink() && !fileStats.isFIFO() && !fileStats.isSocket();
    }
    catch (error) {
        return false;
    }
};
// FIXME note that this is not performance optimized and we do multiple runs on the package data stream
exports.extractPackage = (pkg, destPath, listener = () => { }) => __awaiter(void 0, void 0, void 0, function* () {
    // get a list of all entries in the package
    const entries = yield pkg.getEntries();
    // iterate over all entries and write them to disk next to the package
    // WARNING packages can have different structures: if the .tar.gz has a nested dir it is fine
    // if not the files will directly be in the directory which can cause all kinds of problems
    // in this case we should try to create an extra subdir
    const extractedPackagePath = destPath;
    if (!fs_1.default.existsSync(extractedPackagePath)) {
        fs_1.default.mkdirSync(extractedPackagePath, {
            recursive: true
        });
    }
    let i = 0;
    for (const entry of entries) {
        // the full path where we want to write the package entry's contents on disk
        const destPath = path_1.default.join(extractedPackagePath, entry.relativePath);
        // console.log('create dir sync', destPath)
        if (entry.file.isDir) {
            if (!fs_1.default.existsSync(destPath)) {
                fs_1.default.mkdirSync(destPath, {
                    recursive: true
                });
            }
        }
        else {
            try {
                // try to overwrite
                if (fs_1.default.existsSync(destPath)) {
                    fs_1.default.unlinkSync(destPath);
                }
                // IMPORTANT: if the binary already exists the mode cannot be set
                // FIXME make sure the written file has same attributes / mode / permissions etc
                fs_1.default.writeFileSync(destPath, yield entry.file.readContent());
            }
            catch (error) {
                console.log('error during extraction', error);
            }
        }
        // TODO change to size based progress?
        const progress = Math.floor((100 / entries.length) * ++i);
        if (listener) {
            try {
                listener(IStateListener_1.PROCESS_STATES.EXTRACT_PACKAGE_PROGRESS, {
                    progress,
                    file: entry.file.name,
                    destPath
                });
            }
            catch (error) {
                console.log('error in onProgress handler');
            }
        }
    }
    return extractedPackagePath;
});
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
exports.downloadNpmPackage = (moduleName) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.streamToBuffer = (stream, size) => __awaiter(void 0, void 0, void 0, function* () {
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
        stream.on('error', (error) => {
            reject(error);
        });
        mStream.once('finish', () => {
            resolve(mStream.buffer);
        });
        /*
        stream.on('end', () => {
          // console.log( ((Date.now()-t0) / 1000) , ' finished processing')
          console.log('end of stream', completed, '/',  size)
          if (!mStream.buffer) {
            mStream.once('finish', () => {
              console.log('finish called!!!')
            })
          } else {
            // TODO make sure that buffer also contains bytes stream.end vs mStream.end
            resolve(mStream.buffer)
          }
        })
        */
    });
});
exports.streamPromise = (stream) => {
    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            resolve('end');
        });
        stream.on('finish', () => {
            resolve('finish');
        });
        stream.on('error', (error) => {
            reject(error);
        });
    });
};
exports.bufferToStream = (buf) => {
    const readable = new stream_1.default.Readable();
    readable._read = () => { }; // _read is required but you can noop it
    readable.push(buf);
    readable.push(null);
    return readable;
};
exports.isUrl = (str) => {
    const urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    const url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
};
exports.localFileToIFile = (filePath) => {
    const name = path_1.default.basename(filePath);
    const isDir = exports.isDirSync(filePath);
    const _content = fs_1.default.readFileSync(filePath);
    const file = {
        name,
        size: _content.byteLength,
        isDir,
        readContent: () => Promise.resolve(_content)
    };
    return file;
};
exports.deleteFolderRecursive = function (dirPath) {
    if (fs_1.default.existsSync(dirPath)) {
        fs_1.default.readdirSync(dirPath).forEach((file) => {
            const curPath = path_1.default.join(dirPath, file);
            if (fs_1.default.lstatSync(curPath).isDirectory()) { // recurse
                exports.deleteFolderRecursive(curPath);
            }
            else { // delete file
                fs_1.default.unlinkSync(curPath);
            }
        });
        fs_1.default.rmdirSync(dirPath);
    }
};
exports.is = {
    // due to jsdom all browser env detections will evaluate to true
    // @ts-ignore
    browser: () => typeof __webpack_require__ === 'function'
};
exports.sleep = (t = 2000) => new Promise((resolve, reject) => {
    setTimeout(resolve, t);
});
//# sourceMappingURL=util.js.map