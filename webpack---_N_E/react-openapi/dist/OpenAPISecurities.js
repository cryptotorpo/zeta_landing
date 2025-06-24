import * as React from 'react';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
/**
 * Present securities authorization that can be used for this operation.
 */
export function OpenAPISecurities(props) {
    const { securities, context } = props;
    if (securities.length === 0) {
        return null;
    }
    return (React.createElement(InteractiveSection, { header: "Authorization", className: "openapi-securities", toggeable: true, defaultOpened: false, toggleCloseIcon: context.icons.chevronDown, toggleOpenIcon: context.icons.chevronRight, tabs: securities.map(([key, security]) => {
            return {
                key: key,
                label: key,
                body: (React.createElement(React.Fragment, null,
                    React.createElement("p", { className: "openapi-securities-label" }, getLabelForType(security)),
                    security.description ? (React.createElement(Markdown, { source: security.description, className: "openapi-securities-description" })) : null)),
            };
        }) }));
}
function getLabelForType(security) {
    switch (security.type) {
        case 'apiKey':
            return 'API Key';
        case 'http':
            if (security.scheme === 'basic') {
                return 'Basic Auth';
            }
            if (security.scheme == 'bearer') {
                return `Bearer Token ${security.bearerFormat ? `(${security.bearerFormat})` : ''}`;
            }
            return 'HTTP';
        case 'oauth2':
            return 'OAuth2';
        case 'openIdConnect':
            return 'OpenID Connect';
        default:
            // @ts-ignore
            return security.type;
    }
}
