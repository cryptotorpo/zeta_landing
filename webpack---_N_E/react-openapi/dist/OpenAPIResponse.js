import * as React from 'react';
import classNames from 'classnames';
import { OpenAPIRootSchema, OpenAPISchemaProperties } from './OpenAPISchema';
import { noReference } from './utils';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
/**
 * Display an interactive response body.
 */
export function OpenAPIResponse(props) {
    const { response, context } = props;
    const content = Object.entries(response.content ?? {});
    const headers = Object.entries(response.headers ?? {}).map(([name, header]) => [name, noReference(header) ?? {}]);
    if (content.length === 0 && !response.description && headers.length === 0) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        response.description ? (React.createElement(Markdown, { source: response.description, className: "openapi-response-description" })) : null,
        headers.length > 0 ? (React.createElement(InteractiveSection, { toggeable: true, defaultOpened: !!context.defaultInteractiveOpened, toggleCloseIcon: context.icons.chevronDown, toggleOpenIcon: context.icons.chevronRight, header: "Headers", className: classNames('openapi-responseheaders') },
            React.createElement(OpenAPISchemaProperties, { properties: headers.map(([name, header]) => ({
                    propertyName: name,
                    schema: noReference(header.schema) ?? {},
                    required: header.required,
                })), context: context }))) : null,
        content.length > 0 ? (React.createElement(InteractiveSection, { header: "Body", className: classNames('openapi-responsebody'), tabs: content.map(([contentType, mediaType]) => {
                return {
                    key: contentType,
                    label: contentType,
                    body: (React.createElement(OpenAPIRootSchema, { schema: noReference(mediaType.schema) ?? {}, context: context })),
                };
            }) })) : null));
}
