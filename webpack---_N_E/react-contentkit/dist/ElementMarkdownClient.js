'use client';
import React from 'react';
import { resolveDynamicBinding } from './dynamic';
import { useContentKitClientContext } from './context';
/**
 * Client component to render the default markdown output and then update it on state update.
 */
export function ElementMarkdownClient(props) {
    const { element, initialMarkdown = element.content, renderMarkdown, children: initialChildren, } = props;
    const [children, setChildren] = React.useState(null);
    const context = useContentKitClientContext();
    const markdown = resolveDynamicBinding(context.state, element.content);
    React.useEffect(() => {
        if (initialMarkdown === markdown) {
            setChildren(null);
            return;
        }
        let cancelled = false;
        (async () => {
            const parsed = await renderMarkdown(markdown);
            if (!cancelled) {
                setChildren(parsed);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [initialMarkdown, markdown]);
    return React.createElement(React.Fragment, null, children || initialChildren);
}
