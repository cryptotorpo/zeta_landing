'use client';
import * as React from 'react';
import { IconStyle } from './types';
const version = 2;
const IconsContext = React.createContext({
    iconStyle: IconStyle.Regular,
});
/**
 * Provider to control the loading of icons.
 */
export function IconsProvider(props) {
    const parent = React.useContext(IconsContext);
    const { children, assetsURL = parent.assetsURL, assetsURLToken = parent.assetsURLToken, iconStyle = parent.iconStyle, assetsByStyles = parent.assetsByStyles, } = props;
    const value = React.useMemo(() => {
        return { assetsURL, assetsURLToken, iconStyle, assetsByStyles };
    }, [assetsURL, assetsURLToken, iconStyle, assetsByStyles]);
    return React.createElement(IconsContext.Provider, { value: value }, children);
}
/**
 * Hook to access the current icons context.
 */
export function useIcons() {
    return React.useContext(IconsContext);
}
/**
 * Get the URL for an asset.
 */
export function getAssetURL(location, path) {
    if (!location.assetsURL) {
        throw new Error('You first need to pass a assetsURL to <IconsProvider>');
    }
    const rawUrl = location.assetsURL + (location.assetsURL.endsWith('/') ? '' : '/') + path + `?v=${version}`;
    if (location.assetsURLToken) {
        const url = new URL(rawUrl);
        url.searchParams.set('token', location.assetsURLToken);
        return url.toString();
    }
    else {
        return rawUrl;
    }
}
/**
 * Get the URL for the SVG of an icon.
 */
export function getIconAssetURL(context, style, icon) {
    const location = context.assetsByStyles?.[style] ?? context;
    return getAssetURL(location, `svgs/${style}/${icon}.svg`);
}
