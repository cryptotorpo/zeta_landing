'use client';
import React from 'react';
import classNames from 'classnames';
import { useContentKitClientContext } from './context';
export function ElementButton(props) {
    const { element, icon, trailingIcon } = props;
    const clientContext = useContentKitClientContext();
    const [loading, setLoading] = React.useState(false);
    // TODO:
    // - loading
    // - confirm
    return (React.createElement("button", { title: element.tooltip, className: classNames('contentkit-button', `contentkit-button-style-${element.style ?? 'secondary'}`, loading ? 'contentkit-button-loading' : null), onClick: (event) => {
            if (element.disabled || loading) {
                return;
            }
            event.stopPropagation();
            setLoading(true);
            clientContext.dispatchAction(element.onPress).finally(() => {
                setLoading(false);
            });
        } },
        icon,
        element.label ? (React.createElement("span", { className: "contentkit-button-label" }, element.label)) : null,
        trailingIcon));
}
