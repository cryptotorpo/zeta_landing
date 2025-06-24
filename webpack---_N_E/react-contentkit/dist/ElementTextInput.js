'use client';
import React from 'react';
import classNames from 'classnames';
import { useContentKitClientContext } from './context';
import { getStateStringValue } from './dynamic';
export function ElementTextInput(props) {
    const { element } = props;
    const clientContext = useContentKitClientContext();
    const value = getStateStringValue(clientContext.state, element.state) ?? element.initialValue ?? '';
    const onChange = (event) => {
        clientContext.setState({
            [element.state]: event.target.value,
        });
    };
    if (element.multiline) {
        return (React.createElement("textarea", { disabled: element.disabled, className: classNames('contentkit-textinput'), value: value, placeholder: element.placeholder, onChange: onChange }));
    }
    return (React.createElement("input", { type: element.inputType ?? 'text', disabled: element.disabled, className: classNames('contentkit-textinput'), value: value, placeholder: element.placeholder, onChange: onChange }));
}
