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
const path_1 = __importDefault(require("path"));
const IStateListener_1 = require("../IStateListener");
const chalk_1 = __importDefault(require("chalk"));
const cli_table_1 = __importDefault(require("cli-table"));
const boxen_1 = __importDefault(require("boxen"));
const task_1 = require("./task");
const util_1 = require("../util");
const utils_1 = require("./utils");
exports.printError = (error) => {
    console.log(chalk_1.default.white.bgRed.bold(typeof error === 'string' ? error : error.message));
};
exports.printWarning = (msg) => {
    console.log(`${chalk_1.default.red('✖')} ${chalk_1.default.yellowBright.bold(msg)}`);
};
exports.printSuccess = (msg) => {
    console.log(`${chalk_1.default.green('✔')} ${chalk_1.default.bold(msg)}`);
};
exports.print = (msg) => {
    console.log(chalk_1.default.bold(msg));
};
/**
 * Takes a list of IRelease objects and prints them as a table
 * with property values as columns for each property key specified by attributes
 * @param releases
 * @param attributes comma separated list of property keys
 */
exports.printFormattedReleaseList = (releases, attributes = 'fileName,version,updated_at') => {
    const attributeList = attributes.split(',');
    const releaseList = releases.map(release => {
        // only include white-listed attributes in output
        // also respect attribute order
        const output = [];
        for (const att of attributeList) {
            if (att in release) {
                // @ts-ignore
                const val = release[att];
                // cli-table has issues with undefined.toString()
                output.push(val === undefined ? '' : val);
            }
            else {
                const { val, path } = utils_1.recursiveSearch(release, att);
                output.push(val === undefined ? '' : val);
            }
        }
        return output;
    });
    let table = new cli_table_1.default({
        head: attributeList
    });
    table.push(...releaseList);
    console.log(table.toString());
};
exports.printFormattedRelease = (release) => {
    if (!release) {
        return console.log('No release info provided!');
    }
    if ('original' in release) {
        release = Object.assign({}, release);
        release.original = '<Original response data removed from output>';
    }
    console.log(boxen_1.default(JSON.stringify(release, undefined, 2)));
};
exports.printFormattedSignerInfo = (signature) => {
    const { exp, address, certificates } = signature;
    if (typeof exp === 'number') {
        exports.print(`-> Signature by ${address} expires: ${new Date(exp * 1000)}`);
    }
};
exports.printFormattedVerificationResult = (result, warnUntrusted = true) => {
    if (result.error) {
        return exports.printError(result.error.message);
    }
    if (result.signers.length > 0) {
        const signerAddresses = result.signers.map(s => s.address).join(',');
        exports.printSuccess(`Package is ${chalk_1.default.blueBright('signed')}: Package contents are signed by [${signerAddresses}]`);
    }
    if (result.isValid) {
        exports.printSuccess(`Package is ${chalk_1.default.cyan('valid')}: Package contents are ${chalk_1.default.blueBright('signed')} and passed integrity checks`);
    }
    else {
        exports.printError('Invalid package. The signatures do not match or are corrupted due to modifications');
    }
    if (result.signers.length > 0 && !result.isTrusted) {
    }
    if (warnUntrusted) {
        if (result.isTrusted) {
            exports.printSuccess(`Package is ${chalk_1.default.greenBright('trusted')}: Signatures are ${chalk_1.default.cyan('valid')} and the key of at least one valid signature matches with a trusted address`);
        }
        else {
            exports.printWarning(`Package is NOT ${chalk_1.default.greenBright('trusted')}: The key used to sign has no certificate and no trusted address was provided!\nThere is no proof that the signature was created by the author or entity you might believe it was`);
        }
    }
    const { signers } = result;
    signers.forEach(signer => exports.printFormattedSignerInfo(signer));
};
exports.printFormattedPackageEntries = (pkg) => __awaiter(void 0, void 0, void 0, function* () {
    const entries = yield pkg.getEntries();
    const printEntries = entries.slice(0, 30);
    const lengthLongestPath = printEntries.reduce((prev, cur) => prev.relativePath.length > cur.relativePath.length ? prev : cur).relativePath.length;
    console.log(printEntries.map(e => `- ${e.relativePath} ${' '.repeat(lengthLongestPath - e.relativePath.length)} ${util_1.formatBytes(e.file.size) || 'NaN'}`).join('\n'));
    if (entries.length > 30) {
        console.log(entries.length - printEntries.length, 'More files');
    }
    return entries;
});
exports.printFormattedPackageInfo = (pkg, verificationInfo) => __awaiter(void 0, void 0, void 0, function* () {
    if (!pkg) {
        return console.log('Cannot inspect invalid package');
    }
    let { fileName, filePath, metadata, size } = pkg;
    let { name, version /*, size*/ } = metadata || {};
    console.log(`📦 ${fileName}@${version}`);
    console.log('=== Package Contents ===');
    const entries = yield exports.printFormattedPackageEntries(pkg);
    console.log('=== Package Details ===');
    console.log(`name:          ${name}`);
    console.log(`version:       ${version}`);
    console.log(`filename:      ${fileName}`);
    console.log(`package size:  ${util_1.formatBytes(size)}`);
    // unpacked size: 1.9 kB    
    // shasum:        b7682338f315f0b4f
    // integrity:     sha512-iALBTO+6YH[...]GsfqhVK/bNExA==
    console.log(`total files:   ${entries.length}`);
    /*
    console.log('=== Signature Details ===')
    const signatureInfo = boxen(`${JSON.stringify(verificationInfo, undefined, 2)}`, {
      borderColor: 'cyanBright' // TODO color based on signature status: green, yellow, red
    })
    console.log(`${chalk.bold('Signature info:')}\n${signatureInfo}\n${chalk.bold(`Files (${files.length}):`)}\n${paths}`)
    */
});
const startTask = (name) => {
    return task_1.startNewTask(name);
};
exports.PROCESSES = {
    FETCHING_RELEASE_LIST: {},
    FILTER_RELEASE_LIST: {}
};
exports.createCLIPrinter = (processStates = []) => {
    let task;
    // TODO catch errors in listener
    // TODO allow event queue and async processing
    const listener = (newState, args = {}) => {
        // return console.log('new state', newState, Object.keys(args))
        switch (newState) {
            case IStateListener_1.PROCESS_STATES.FETCHING_RELEASE_LIST_STARTED: {
                const { repo } = args;
                task = startTask(`Fetching releases from ${repo}`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.FETCHING_RELEASE_LIST_FINISHED: {
                const { releases, repo } = args;
                if (task) {
                    task.succeed(`Fetched ${releases.length} releases from ${repo}`);
                }
                break;
            }
            case IStateListener_1.PROCESS_STATES.FILTER_RELEASE_LIST_STARTED: {
                task = startTask(`Filtering releases`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.FILTER_RELEASE_LIST_FINISHED: {
                const { releases } = args;
                if (task) {
                    task.succeed(`Filtered releases to ${releases.length}`);
                }
                break;
            }
            case IStateListener_1.PROCESS_STATES.FILTERED_INVALID_RELEASES: {
                const { invalid } = args;
                console.log(chalk_1.default.yellow(`WARNING: filtered ${invalid.length} corrupted releases`));
                break;
            }
            case IStateListener_1.PROCESS_STATES.RESOLVE_PACKAGE_STARTED: {
                // WARNING: wraps multiple
                // task = startTask('[1/2] Resolving package...')
                break;
            }
            case IStateListener_1.PROCESS_STATES.RESOLVE_PACKAGE_FINISHED: {
                const { release } = args;
                startTask(`Resolving Package`).succeed(`Package query resolved to: `);
                // TODO await?
                exports.printFormattedRelease(release);
                break;
            }
            case IStateListener_1.PROCESS_STATES.DOWNLOAD_STARTED: {
                task = startTask('Downloading package...');
                break;
            }
            case IStateListener_1.PROCESS_STATES.DOWNLOAD_PROGRESS: {
                const { progress, size } = args;
                task.updateText(chalk_1.default.greenBright(`Downloading package... ${progress}% \t|| ${util_1.formatBytes(progress / 100 * size)} / ${util_1.formatBytes(size)} ||`));
                break;
            }
            case IStateListener_1.PROCESS_STATES.DOWNLOAD_FINISHED: {
                const { size } = args;
                let cb = ({ taskName, timeMs }) => `${taskName}\t\t || Time: ${timeMs} ms || Size: ${util_1.formatBytes(size)} || Speed: ${((size / 1024) / (timeMs / 1000)).toFixed(2)} KB/s ||`;
                task.succeed(cb);
                break;
            }
            case IStateListener_1.PROCESS_STATES.CREATE_PACKAGE_STARTED: {
                task = startTask('Creating package');
                break;
            }
            case IStateListener_1.PROCESS_STATES.CREATE_PACKAGE_PROGRESS: {
                const { file } = args;
                task.updateText(`Packing file: "${file}" ...`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.CREATE_PACKAGE_FINISHED: {
                const { pkg } = args;
                task.succeed(`Package created "${pkg.fileName}"`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.UNLOCKING_KEY_STARTED: {
                const { filePath: keyPath } = args;
                task = startTask(`Unlocking key ${keyPath}`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.UNLOCKING_KEY_FINISHED: {
                const { address } = args;
                task.succeed(`Key unlocked: ${address}`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.FINDING_KEY_BY_ALIAS_STARTED: {
                const { alias } = args;
                task = startTask(`Finding key by alias "${alias}"`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.FINDING_KEY_BY_ALIAS_FINISHED: {
                const { alias, key } = args;
                task.succeed(`Key found for alias "${alias}": ${key && key.address}`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.CREATE_PAYLOAD_STARTED: {
                task = startTask(`Creating signature payload ...`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.CREATE_PAYLOAD_FINISHED: {
                const { payload } = args;
                task.succeed(`Signature payload created: ${Object.keys(payload).length} checksums`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.VERIFY_JWS_STARTED: {
                const { signatureEntry } = args;
                const signaturePath = path_1.default.basename(signatureEntry.relativePath);
                task = startTask(`Verifying JWS: ${signaturePath}`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.VERIFY_JWS_FINISHED: {
                const { decodedToken, signatureEntry } = args;
                const signaturePath = path_1.default.basename(signatureEntry.relativePath);
                task.succeed(`Verified JWS with signature algorithm: ${decodedToken && JSON.stringify(decodedToken.header.alg)}: ${signaturePath}`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.COMPARE_DIGESTS_STARTED: {
                task = task_1.startNewTask(`Comparing calculated digests with signature`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.COMPARE_DIGESTS_FINISHED: {
                task.succeed(`Finished comparing package digests with signature`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.RECOVER_SIGNATURE_ADDRESS_STARTED: {
                task = task_1.startNewTask(`Recovering public key from signature`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.RECOVER_SIGNATURE_ADDRESS_FINISHED: {
                task.succeed(`Recovered public key from signature`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.RESOLVE_ENS_STARTED: {
                const { name } = args;
                task = task_1.startNewTask(`Resolving ENS name "${name}"`);
                break;
            }
            case IStateListener_1.PROCESS_STATES.RESOLVE_ENS_FINISHED: {
                const { name, address } = args;
                task.succeed(`Resolved ENS name "${name}" to address: ${address}`);
                break;
            }
        }
    };
    return {
        listener,
        print: (text, { isTask = true, bold = true } = {}) => {
            if (isTask) {
                task_1.startNewTask(text).succeed(text);
            }
            else {
                console.log(bold ? chalk_1.default.bold(text) : text);
            }
        },
        fail: (error) => {
            let errorMessage = typeof error === 'string' ? error : error.message;
            if (task) {
                task.fail(errorMessage);
            }
            else {
                exports.printError(errorMessage);
            }
        }
    };
};
exports.createResolvePrinter = () => { };
//# sourceMappingURL=printUtils.js.map