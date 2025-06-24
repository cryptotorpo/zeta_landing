'use client';
import React from 'react';
import classNames from 'classnames';
import { useContentKitClientContext } from './context';
/**
 * Interactive card element.
 */
export function ElementCard(props) {
    const { element, children, icon, hint, buttons } = props;
    const clientContext = useContentKitClientContext();
    return (React.createElement("div", { className: classNames('contentkit-card', element.onPress ? 'contentkit-card-pressable' : null), onClick: () => {
            if (element.onPress) {
                clientContext.dispatchAction(element.onPress);
            }
        } },
        element.title ? (React.createElement("div", { className: classNames('contentkit-card-header') },
            icon ? React.createElement("div", { className: classNames('contentkit-card-icon') }, icon) : null,
            React.createElement("div", { className: classNames('contentkit-card-header-content') },
                React.createElement("div", { className: classNames('contentkit-card-title') }, element.title),
                hint ? (React.createElement("div", { className: classNames('contentkit-card-hint') }, hint)) : null),
            buttons && buttons.length > 0 ? (React.createElement("div", { className: classNames('contentkit-card-buttons') }, buttons)) : null)) : null,
        children ? React.createElement("div", { className: classNames('contentkit-card-body') }, children) : null));
}
