"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileToBuffer = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const arraybuf = ev.target.result;
            const buf = Buffer.from(new Uint8Array(arraybuf));
            resolve(buf);
        };
        reader.readAsArrayBuffer(file);
    });
};
//# sourceMappingURL=BrowserUtils.js.map