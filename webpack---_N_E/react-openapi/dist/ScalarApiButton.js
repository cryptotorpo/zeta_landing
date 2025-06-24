'use client';
import { useApiClientModal } from '@scalar/api-client-react';
import React from 'react';
/**
 * Button which launches the Scalar API Client
 */
export function ScalarApiButton({ method, path }) {
    const client = useApiClientModal();
    return (React.createElement("div", { className: "scalar scalar-activate" },
        React.createElement("button", { className: "scalar-activate-button", onClick: () => client?.open({ method, path }) },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "10", height: "12", fill: "none" },
                React.createElement("path", { stroke: "currentColor", strokeWidth: "1.5", d: "M1 10.05V1.43c0-.2.2-.31.37-.22l7.26 4.08c.17.1.17.33.01.43l-7.26 4.54a.25.25 0 0 1-.38-.21Z" })),
            "Test it")));
}
