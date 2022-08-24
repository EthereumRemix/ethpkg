"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const util_1 = require("./util");
describe('utils', () => {
    describe('is', () => {
        it('detect if running in browser', () => {
            chai_1.assert.isFalse(util_1.is.browser());
        });
    });
});
//# sourceMappingURL=util.spec.js.map