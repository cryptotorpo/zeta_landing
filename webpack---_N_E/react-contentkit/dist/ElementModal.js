'use client';
import React from 'react';
import classNames from 'classnames';
import { useContentKitClientContext } from './context';
export function ElementModal(props) {
    const { element, subtitle, children } = props;
    const clientContext = useContentKitClientContext();
    // TODO:
    // - close button
    // - invalid rendering on close?
    // - submit
    const [opened, setOpened] = React.useState(false);
    React.useEffect(() => {
        setOpened(true);
    }, []);
    const onClose = async () => {
        await clientContext.dispatchAction({
            action: '@ui.modal.close',
            returnValue: element.returnValue || {},
        });
    };
    return (React.createElement("div", { className: classNames('contentkit-modal-backdrop'), onClick: onClose },
        React.createElement("div", { className: classNames('contentkit-modal', opened ? 'contentkit-modal-opened' : null), onClick: (event) => {
                event.stopPropagation();
            } },
            React.createElement("div", { className: classNames('contentkit-modal-header') },
                element.title ? (React.createElement("h1", { className: classNames('contentkit-modal-title') }, element.title)) : null,
                subtitle ? React.createElement("div", { className: "contentkit-modal-subtitle" }, subtitle) : null),
            React.createElement("div", { className: classNames('contentkit-modal-body') }, children))));
}
