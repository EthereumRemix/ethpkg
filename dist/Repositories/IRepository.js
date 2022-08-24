"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function instanceOfIRelease(obj) {
    //TODO ['displayVersion', 'channel'].some(p => obj[p])
    return obj.fileName && obj.version;
}
exports.instanceOfIRelease = instanceOfIRelease;
//# sourceMappingURL=IRepository.js.map