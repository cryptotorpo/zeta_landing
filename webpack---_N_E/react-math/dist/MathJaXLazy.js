'use client';
import React from 'react';
const MathJaXFormula = React.lazy(() => import('./MathJaX'));
/**
 * Lazy component that loads MathJax and renders the formula.
 */
export function MathJaXLazy(props) {
    return (React.createElement(React.Suspense, { fallback: props.fallback },
        React.createElement(MathJaXFormula, { ...props })));
}
