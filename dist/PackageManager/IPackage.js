"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function instanceofIPackage(object) {
    return typeof object === 'object' && (typeof object.loadBuffer === 'function') && (typeof object.getEntries === 'function');
}
exports.instanceofIPackage = instanceofIPackage;
//# sourceMappingURL=IPackage.js.map