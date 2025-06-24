'use client';
import * as React from 'react';
import { getIconStyle } from './getIconStyle';
import { getIconAssetURL, useIcons } from './IconsProvider';
/**
 * Renders an icon component from the library.
 * The icon is loaded as a standalone image.
 */
export const Icon = React.forwardRef(function Icon(props, ref) {
    const context = useIcons();
    const { icon: propIcon, iconStyle: propIconStyle = context.iconStyle, className = '', size, ...rest } = props;
    const [iconStyle, icon] = getIconStyle(propIconStyle, propIcon);
    const url = getIconAssetURL(context, iconStyle, icon);
    return (React.createElement("svg", { ref: ref, ...rest, style: {
            maskImage: `url(${url})`,
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            ...(size ? { width: size, height: size } : {}),
            ...rest.style,
        }, className: 'gb-icon ' + className }));
});
