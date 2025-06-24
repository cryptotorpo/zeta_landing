import * as React from 'react';
import classNames from 'classnames';
export function Markdown(props) {
    const { source, className } = props;
    return (React.createElement("div", { className: classNames('openapi-markdown', className), dangerouslySetInnerHTML: { __html: source } }));
}
