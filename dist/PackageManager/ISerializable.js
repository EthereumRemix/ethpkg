"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isSerializable(obj) {
    return obj && typeof obj.getObjectData === 'function';
}
exports.isSerializable = isSerializable;
//# sourceMappingURL=ISerializable.js.map