import * as React from 'react';
import { OpenAPIRootSchema } from './OpenAPISchema';
import { noReference } from './utils';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
/**
 * Display an interactive request body.
 */
export function OpenAPIRequestBody(props) {
    const { requestBody, context } = props;
    return (React.createElement(InteractiveSection, { header: "Body", className: "openapi-requestbody", tabs: Object.entries(requestBody.content ?? {}).map(([contentType, mediaTypeObject]) => {
            return {
                key: contentType,
                label: contentType,
                body: (React.createElement(OpenAPIRootSchema, { schema: noReference(mediaTypeObject.schema) ?? {}, context: context })),
            };
        }), defaultOpened: context.defaultInteractiveOpened }, requestBody.description ? (React.createElement(Markdown, { source: requestBody.description, className: "openapi-requestbody-description" })) : null));
}
