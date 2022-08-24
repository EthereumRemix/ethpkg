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
export declare const recursiveSearch: (data: any, prop: string, path?: string) => any;
