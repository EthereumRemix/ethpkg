"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const spinner = ora_1.default({
    spinner: {
        "interval": 100,
        "frames": [
            "▓",
            "▒",
            "░"
        ]
    }
});
exports.startTask = (name) => {
    spinner.start();
    spinner.text = chalk_1.default.white.bgBlack.bold(' ' + name + '  ');
    // @ts-ignore
    spinner.t_org = name;
};
exports.succeed = (msg) => {
    // @ts-ignore
    let t = chalk_1.default.bold(msg || spinner.t_org);
    spinner.succeed(t);
    if (msg) {
        // console.log(`${chalk.green('✔')} ${chalk.bold(msg)}`)
    }
};
exports.progress = (msg) => {
    console.log(`${chalk_1.default.green('✔')} ${chalk_1.default.bold(msg)}`);
};
exports.failed = (msg, msgText) => {
    let task = '';
    if (msgText) {
        task = msg;
        msg = msgText;
    }
    // @ts-ignore
    let t = chalk_1.default.white.bgRed.bold((spinner.t_org || task) + ' FAILED: ' + (msg || ''));
    spinner.fail(t);
    process.exit();
};
//# sourceMappingURL=task.js.map