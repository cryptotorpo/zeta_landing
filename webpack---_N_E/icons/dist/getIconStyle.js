import stylesMap from './data/styles-map.json';
const cache = new Map();
/**
 * Return the style to load an icon from by its name.
 * Some icons are only available for certain styles.
 */
export function getIconStyle(style, icon) {
    const cached = cache.get(icon)?.get(style);
    if (cached) {
        return cached;
    }
    // Check for exceptions
    let result = [style, icon];
    for (const [onlyStyle, icons] of Object.entries(stylesMap)) {
        if (icons.includes(icon)) {
            result = [onlyStyle, icon];
            break;
        }
    }
    if (!cache.has(icon)) {
        cache.set(icon, new Map());
    }
    cache.get(icon).set(style, result);
    return result;
}
