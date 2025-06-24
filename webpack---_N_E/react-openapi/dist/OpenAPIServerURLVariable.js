'use client';
import * as React from 'react';
import classNames from 'classnames';
/**
 * Interactive component to show the value of a server variable and let the user change it.
 */
export function OpenAPIServerURLVariable(props) {
    const { variable } = props;
    return React.createElement("span", { className: classNames('openapi-url-var') }, variable.default);
}
