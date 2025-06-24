var _sentryCollisionFreeGlobalObject = typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : {};
_sentryCollisionFreeGlobalObject["__sentryRewritesTunnelPath__"] = "/~gitbook/monitoring";
_sentryCollisionFreeGlobalObject["SENTRY_RELEASE"] = {"id":"67a6fb4c8756f5081b0f06413a5f38d1edd3ca5c"};
_sentryCollisionFreeGlobalObject["__sentryBasePath"] = undefined;
_sentryCollisionFreeGlobalObject["__rewriteFramesAssetPrefixPath__"] = "";

import {
    BrowserClient,
    makeFetchTransport,
    defaultStackParser,
    getCurrentScope,
} from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
    // To tree shake default integrations that we don't use
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/tree-shaking/#tree-shaking-default-integrations
    const client = new BrowserClient({
        debug: false,
        dsn,
        integrations: [],
        sampleRate: 0.1,
        enableTracing: false,
        beforeSendTransaction: () => {
            return null;
        },
        transport: makeFetchTransport,
        stackParser: defaultStackParser,
    });

    getCurrentScope().setClient(client);
    client.init();
}
