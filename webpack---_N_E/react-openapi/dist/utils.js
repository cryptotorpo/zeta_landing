export function noReference(input) {
    if (typeof input === 'object' && !!input && '$ref' in input) {
        throw new Error('Reference found');
    }
    return input;
}
export function createStateKey(key, scope) {
    return scope ? `${scope}_${key}` : key;
}
