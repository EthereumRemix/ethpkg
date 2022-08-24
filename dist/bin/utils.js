"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isObject = (obj) => typeof obj === 'object';
const findByPath = (data, path) => {
    const parts = path.split('.');
    for (const part of parts) {
        if (!part)
            continue; //ignore empty strings created by split
        data = data[part];
    }
    return data;
};
/**
 * foo = {
 *  bar: {...},
 *  baz: {
 *    foo: {
 *      moin: 'hello'
 *    }
 *  }
 * }
 * recursiveSearch(foo, 'moin') => { val: 'hello', path: 'baz.foo.moin'}
 * @param data
 * @param prop
 * @param path
 */
exports.recursiveSearch = (data, prop, path = '') => {
    if (isObject(data)) {
        if (data && prop in data) {
            path = path + (path ? '.' : '') + prop;
            return {
                val: data[prop],
                path
            };
        }
        else {
            for (let key in data) {
                if (isObject(data[key])) {
                    let newPath = path + (path ? '.' : '') + key;
                    let { val, path: newPath2 } = exports.recursiveSearch(data[key], prop, newPath);
                    if (val) {
                        return {
                            val,
                            path: newPath2
                        };
                    }
                }
            }
        }
    }
    return {
        val: undefined,
        path
    };
};
//# sourceMappingURL=utils.js.map