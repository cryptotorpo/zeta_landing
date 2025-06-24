import * as React from 'react';
export const ContentKitClientContext = React.createContext(null);
/**
 * Get the current contentkit context.
 */
export function useContentKitClientContext() {
    const context = React.useContext(ContentKitClientContext);
    if (!context) {
        throw new Error('ContentKit component should be wrapped in <ContentKit>');
    }
    return context;
}
