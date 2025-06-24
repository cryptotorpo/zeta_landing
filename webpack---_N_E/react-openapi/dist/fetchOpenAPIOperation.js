import { toJSON, fromJSON } from 'flatted';
import YAML from 'yaml';
import swagger2openapi from 'swagger2openapi';
import { resolveOpenAPIPath } from './resolveOpenAPIPath';
export { toJSON, fromJSON };
/**
 * Resolve an OpenAPI operation in a file and compile it to a more usable format.
 */
export async function fetchOpenAPIOperation(input, rawFetcher) {
    const fetcher = cacheFetcher(rawFetcher);
    let operation = await resolveOpenAPIPath(input.url, ['paths', input.path, input.method], fetcher);
    if (!operation) {
        return null;
    }
    const specData = await fetcher.fetch(input.url);
    // Resolve common parameters
    const commonParameters = await resolveOpenAPIPath(input.url, ['paths', input.path, 'parameters'], fetcher);
    if (commonParameters) {
        operation = {
            ...operation,
            parameters: [...commonParameters, ...(operation.parameters ?? [])],
        };
    }
    // Resolve servers
    const servers = await resolveOpenAPIPath(input.url, ['servers'], fetcher);
    // Resolve securities
    const securities = [];
    for (const security of operation.security ?? []) {
        const securityKey = Object.keys(security)[0];
        const securityScheme = await resolveOpenAPIPath(input.url, ['components', 'securitySchemes', securityKey], fetcher);
        if (securityScheme) {
            securities.push([securityKey, securityScheme]);
        }
    }
    return {
        servers: servers ?? [],
        operation,
        method: input.method,
        path: input.path,
        securities,
        'x-codeSamples': typeof specData['x-codeSamples'] === 'boolean' ? specData['x-codeSamples'] : undefined,
        'x-hideTryItPanel': typeof specData['x-hideTryItPanel'] === 'boolean'
            ? specData['x-hideTryItPanel']
            : undefined,
    };
}
function cacheFetcher(fetcher) {
    const cache = new Map();
    return {
        async fetch(url) {
            if (cache.has(url)) {
                return cache.get(url);
            }
            const promise = fetcher.fetch(url);
            cache.set(url, promise);
            return promise;
        },
        parseMarkdown: fetcher.parseMarkdown,
    };
}
/**
 * Parse a raw string into an OpenAPI document.
 * It will also convert Swagger 2.0 to OpenAPI 3.0.
 * It can throw an `OpenAPIFetchError` if the document is invalid.
 */
export async function parseOpenAPIV3(url, text) {
    // Parse the JSON or YAML
    let data;
    // Try with JSON
    try {
        data = JSON.parse(text);
    }
    catch (jsonError) {
        try {
            // Try with YAML
            data = YAML.parse(text);
        }
        catch (yamlError) {
            if (yamlError instanceof Error && yamlError.name.startsWith('YAML')) {
                throw new OpenAPIFetchError('Failed to parse YAML: ' + yamlError.message, url);
            }
            else {
                throw yamlError;
            }
        }
    }
    // Convert Swagger 2.0 to OpenAPI 3.0
    // @ts-ignore
    if (data && data.swagger) {
        try {
            // Convert Swagger 2.0 to OpenAPI 3.0
            // @ts-ignore
            const result = (await swagger2openapi.convertObj(data, {
                resolve: false,
                resolveInternal: false,
                laxDefaults: true,
                laxurls: true,
                lint: false,
                prevalidate: false,
                anchors: true,
                patch: true,
            }));
            data = result.openapi;
        }
        catch (error) {
            if (error.name === 'S2OError') {
                throw new OpenAPIFetchError('Failed to convert Swagger 2.0 to OpenAPI 3.0: ' + error.message, url);
            }
            else {
                throw error;
            }
        }
    }
    // @ts-ignore
    return data;
}
export class OpenAPIFetchError extends Error {
    url;
    name = 'OpenAPIFetchError';
    constructor(message, url) {
        super(message);
        this.url = url;
    }
}
