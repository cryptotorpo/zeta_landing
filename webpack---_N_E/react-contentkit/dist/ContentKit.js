'use client';
import React from 'react';
import { ContentKitClientContext, } from './context';
import { resolveDynamicBinding } from './dynamic';
/**
 * Render a ContentKit component.
 * The approach is optimized to work well with server components and
 * allow rendering the components in the server with the lifecycle managed on the client side.
 */
export function ContentKit(props) {
    const { security, initialInput, initialOutput, children: initialChildren, render, onAction, onComplete, } = props;
    const [current, setCurrent] = React.useState({
        /** Current input being rendered */
        input: initialInput,
        /** React rendered elements for the input */
        children: initialChildren,
        /** Output of the rendering */
        output: initialOutput,
        /** Local state */
        state: initialOutput.state ?? {},
    });
    const [subView, setSubView] = React.useState(null);
    const update = React.useCallback(async (update) => {
        const newInput = {
            ...current.input,
            // Use the props from the output if output sent new props
            ...(current.output?.props ? { props: current.output.props } : {}),
            ...update,
            // Merge the state
            state: {
                ...current.input.state,
                ...current.state,
                ...update.state,
            },
        };
        console.log('transition to input', newInput);
        const result = await render(newInput);
        const output = result.output;
        if (output.type === 'complete') {
            return onComplete?.(output.returnValue);
        }
        console.log('and got output', output, 'for', newInput);
        setCurrent((prev) => ({
            input: newInput,
            children: result.children,
            output: output,
            state: prev.state,
        }));
    }, [setCurrent, current, render, onComplete]);
    const renderer = React.useMemo(() => {
        return {
            security,
            state: current.state,
            setState: (newState) => {
                setCurrent((latest) => ({
                    ...latest,
                    state: {
                        ...latest.state,
                        ...newState,
                    },
                }));
            },
            update,
            dispatchAction: async (inputAction, bubble = true) => {
                const action = resolveDynamicBinding(current.state, inputAction);
                if (bubble) {
                    onAction?.(action);
                }
                console.log('action', action);
                switch (action.action) {
                    case '@ui.modal.open': {
                        const modalInput = {
                            componentId: action.componentId,
                            props: action.props,
                            context: current.input.context,
                            action,
                        };
                        // Prefetch the modal content to show a loading in the button opening the button
                        const result = await render(modalInput);
                        if (result.output.type === 'element' || !result.output.type) {
                            setSubView({
                                mode: 'modal',
                                initialInput: modalInput,
                                initialOutput: result.output,
                                initialChildren: result.children,
                            });
                        }
                        break;
                    }
                    case '@ui.url.open': {
                        window.open(action.url, '_blank');
                        break;
                    }
                    default: {
                        await update({
                            action,
                        });
                        break;
                    }
                }
            },
        };
    }, [update, security, current.state, current.input.context, setCurrent, render]);
    const onSubViewAction = React.useCallback(async (action) => {
        switch (action.action) {
            case '@ui.modal.close': {
                update({
                    action,
                });
                setSubView(null);
                break;
            }
        }
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(ContentKitClientContext.Provider, { value: renderer }, current.children),
        subView ? (React.createElement(ContentKit, { security: security, initialInput: subView.initialInput, initialOutput: subView.initialOutput, render: render, onAction: onSubViewAction }, subView.initialChildren)) : null));
}
