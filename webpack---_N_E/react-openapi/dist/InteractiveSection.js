'use client';
import classNames from 'classnames';
import React from 'react';
import { atom, useRecoilState } from 'recoil';
const syncedTabsAtom = atom({
    key: 'syncedTabState',
    default: {},
});
/**
 * To optimize rendering, most of the components are server-components,
 * and the interactiveness is mainly handled by a few key components like this one.
 */
export function InteractiveSection(props) {
    const { id, className, toggeable = false, defaultOpened = true, tabs = [], defaultTab = tabs[0]?.key, header, children, overlay, toggleOpenIcon = '▶', toggleCloseIcon = '▼', stateKey, } = props;
    const [syncedTabs, setSyncedTabs] = useRecoilState(syncedTabsAtom);
    const tabFromState = stateKey && stateKey in syncedTabs
        ? tabs.find((tab) => tab.key === syncedTabs[stateKey])
        : undefined;
    const [opened, setOpened] = React.useState(defaultOpened);
    const [selectedTabKey, setSelectedTab] = React.useState(tabFromState?.key ?? defaultTab);
    const selectedTab = tabFromState ?? tabs.find((tab) => tab.key === selectedTabKey) ?? tabs[0];
    return (React.createElement("div", { id: id, className: classNames('openapi-section', toggeable ? 'openapi-section-toggeable' : null, className, toggeable ? `${className}-${opened ? 'opened' : 'closed'}` : null) },
        React.createElement("div", { onClick: () => {
                if (toggeable) {
                    setOpened(!opened);
                }
            }, className: classNames('openapi-section-header', `${className}-header`) },
            React.createElement("div", { className: classNames('openapi-section-header-content', `${className}-header-content`) }, header),
            React.createElement("div", { className: classNames('openapi-section-header-controls', `${className}-header-controls`), onClick: (event) => {
                    event.stopPropagation();
                } },
                tabs.length ? (React.createElement("select", { className: classNames('openapi-section-select', 'openapi-select', `${className}-tabs-select`), value: selectedTab.key, onChange: (event) => {
                        setSelectedTab(event.target.value);
                        if (stateKey) {
                            setSyncedTabs((state) => ({
                                ...state,
                                [stateKey]: event.target.value,
                            }));
                        }
                        setOpened(true);
                    } }, tabs.map((tab) => (React.createElement("option", { key: tab.key, value: tab.key }, tab.label))))) : null,
                (children || selectedTab?.body) && toggeable ? (React.createElement("button", { className: classNames('openapi-section-toggle', `${className}-toggle`), onClick: () => setOpened(!opened) }, opened ? toggleCloseIcon : toggleOpenIcon)) : null)),
        (!toggeable || opened) && (children || selectedTab?.body) ? (React.createElement("div", { className: classNames('openapi-section-body', `${className}-body`) },
            children,
            selectedTab?.body)) : null,
        overlay));
}
