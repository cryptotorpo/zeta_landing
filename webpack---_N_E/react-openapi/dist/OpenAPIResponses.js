import * as React from 'react';
import classNames from 'classnames';
import { createStateKey, noReference } from './utils';
import { OpenAPIResponse } from './OpenAPIResponse';
import { InteractiveSection } from './InteractiveSection';
/**
 * Display an interactive response body.
 */
export function OpenAPIResponses(props) {
    const { responses, context } = props;
    return (React.createElement(InteractiveSection, { stateKey: createStateKey('response', context.blockKey), header: "Response", className: classNames('openapi-responses'), tabs: Object.entries(responses).map(([statusCode, response]) => {
            return {
                key: statusCode,
                label: statusCode,
                body: React.createElement(OpenAPIResponse, { response: noReference(response), context: context }),
            };
        }) }));
}
