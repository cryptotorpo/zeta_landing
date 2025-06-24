const SYMBOL_MARKDOWN_PARSED = '__$markdownParsed';
export const SYMBOL_REF_RESOLVED = '__$refResolved';
/**
 * Resolve a path in a OpenAPI file.
 * It resolves any reference needed to resolve the path, ignoring other references outside the path.
 */
export async function resolveOpenAPIPath(url, dataPath, fetcher) {
    const data = await fetcher.fetch(url);
    let value = data;
    if (!value) {
        return undefined;
    }
    const lastKey = dataPath[dataPath.length - 1];
    dataPath = dataPath.slice(0, -1);
    for (const part of dataPath) {
        // @ts-ignore
        if (isRef(value[part])) {
            await transformAll(url, value, part, fetcher);
        }
        // @ts-ignore
        value = value[part];
        // If any part along the path is undefined, return undefined.
        if (typeof value !== 'object' || value === null) {
            return undefined;
        }
    }
    await transformAll(url, value, lastKey, fetcher);
    // @ts-expect-error
    return value[lastKey];
}
/**
 * Recursively process a part of the OpenAPI spec to resolve all references.
 */
async function transformAll(url, data, key, fetcher) {
    const value = data[key];
    if (typeof value === 'string' &&
        key === 'description' &&
        fetcher.parseMarkdown &&
        !data[SYMBOL_MARKDOWN_PARSED]) {
        // Parse markdown
        data[SYMBOL_MARKDOWN_PARSED] = true;
        data[key] = await fetcher.parseMarkdown(value);
    }
    else if (typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null) {
        // Primitives
    }
    else if (typeof value === 'object' && value !== null && SYMBOL_REF_RESOLVED in value) {
        // Ref was already resolved
    }
    else if (isRef(value)) {
        const ref = value.$ref;
        // Delete the ref to avoid infinite loop with circular references
        // @ts-ignore
        delete value.$ref;
        data[key] = await resolveReference(url, ref, fetcher);
        if (data[key]) {
            data[key][SYMBOL_REF_RESOLVED] = extractRefName(ref);
        }
    }
    else if (Array.isArray(value)) {
        // Recursively resolve all references in the array
        await Promise.all(value.map((item, index) => transformAll(url, value, index, fetcher)));
    }
    else if (typeof value === 'object' && value !== null) {
        // Recursively resolve all references in the object
        const keys = Object.keys(value);
        for (const key of keys) {
            await transformAll(url, value, key, fetcher);
        }
    }
}
async function resolveReference(origin, ref, fetcher) {
    const parsed = parseReference(origin, ref);
    return resolveOpenAPIPath(parsed.url, parsed.dataPath, fetcher);
}
function parseReference(origin, ref) {
    if (!ref) {
        return {
            url: origin,
            dataPath: [],
        };
    }
    if (ref.startsWith('#')) {
        // Local references
        const dataPath = ref.split('/').filter(Boolean).slice(1);
        return {
            url: origin,
            dataPath,
        };
    }
    // Absolute references
    const url = new URL(ref, origin);
    if (url.hash) {
        const hash = url.hash;
        url.hash = '';
        return parseReference(url.toString(), hash);
    }
    return {
        url: url.toString(),
        dataPath: [],
    };
}
function extractRefName(ref) {
    const parts = ref.split('/');
    return parts[parts.length - 1];
}
function isRef(ref) {
    return typeof ref === 'object' && ref !== null && '$ref' in ref && ref.$ref;
}
