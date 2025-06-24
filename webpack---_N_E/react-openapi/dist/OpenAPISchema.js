import classNames from 'classnames';
import React, { useId } from 'react';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { SYMBOL_REF_RESOLVED } from './resolveOpenAPIPath';
import { noReference } from './utils';
/**
 * Render a property of an OpenAPI schema.
 */
export function OpenAPISchemaProperty(props) {
    const { propertyName, required, schema, circularRefs: parentCircularRefs = new Map(), context, className, } = props;
    const id = useId();
    const parentCircularRef = parentCircularRefs.get(schema);
    const circularRefs = new Map(parentCircularRefs).set(schema, id);
    // Avoid recursing infinitely, and instead render a link to the parent schema
    const properties = parentCircularRef ? null : getSchemaProperties(schema);
    const alternatives = parentCircularRef
        ? null
        : getSchemaAlternatives(schema, new Set(circularRefs.keys()));
    const shouldDisplayExample = (schema) => {
        return (typeof schema.example === 'string' ||
            typeof schema.example === 'number' ||
            typeof schema.example === 'boolean');
    };
    return (React.createElement(InteractiveSection, { id: id, className: classNames('openapi-schema', className), toggeable: !!properties || !!alternatives, defaultOpened: !!context.defaultInteractiveOpened, toggleOpenIcon: context.icons.chevronRight, toggleCloseIcon: context.icons.chevronDown, tabs: alternatives?.[0].map((alternative, index) => ({
            key: `${index}`,
            label: getSchemaTitle(alternative, alternatives[1]),
            body: circularRefs.has(alternative) ? (React.createElement(OpenAPISchemaCircularRef, { id: circularRefs.get(alternative), schema: alternative })) : (React.createElement(OpenAPISchemaAlternative, { schema: alternative, circularRefs: circularRefs, context: context })),
        })), header: React.createElement("div", { className: classNames('openapi-schema-presentation') },
            React.createElement("div", { className: classNames('openapi-schema-name') },
                propertyName ? (React.createElement("span", { className: classNames('openapi-schema-propertyname') }, propertyName)) : null,
                required ? (React.createElement("span", { className: classNames('openapi-schema-required') }, "*")) : null,
                React.createElement("span", { className: classNames('openapi-schema-type') }, getSchemaTitle(schema))),
            schema.description ? (React.createElement(Markdown, { source: schema.description, className: "openapi-schema-description" })) : null,
            shouldDisplayExample(schema) ? (React.createElement("span", { className: "openapi-schema-example" },
                "Example: ",
                React.createElement("code", null, JSON.stringify(schema.example)))) : null,
            schema.pattern ? (React.createElement("div", { className: "openapi-schema-pattern" },
                "Pattern: ",
                React.createElement("code", null, schema.pattern))) : null) }, (properties && properties.length > 0) ||
        (schema.enum && schema.enum.length > 0) ||
        parentCircularRef ? (React.createElement(React.Fragment, null,
        properties?.length ? (React.createElement(OpenAPISchemaProperties, { properties: properties, circularRefs: circularRefs, context: context })) : null,
        schema.enum && schema.enum.length > 0 ? (React.createElement(OpenAPISchemaEnum, { enumValues: schema.enum })) : null,
        parentCircularRef ? (React.createElement(OpenAPISchemaCircularRef, { id: parentCircularRef, schema: schema })) : null)) : null));
}
/**
 * Render a set of properties of an OpenAPI schema.
 */
export function OpenAPISchemaProperties(props) {
    const { id, properties, circularRefs, context } = props;
    if (!properties.length) {
        return null;
    }
    return (React.createElement("div", { id: id, className: classNames('openapi-schema-properties') }, properties.map((property) => (React.createElement(OpenAPISchemaProperty, { key: property.propertyName, circularRefs: circularRefs, ...property, context: context })))));
}
/**
 * Render a root schema (such as the request body or response body).
 */
export function OpenAPIRootSchema(props) {
    const { schema, context } = props;
    // Avoid recursing infinitely, and instead render a link to the parent schema
    const properties = getSchemaProperties(schema);
    if (properties && properties.length > 0) {
        return React.createElement(OpenAPISchemaProperties, { properties: properties, context: context });
    }
    return (React.createElement(OpenAPISchemaProperty, { schema: schema, context: context, className: "openapi-schema-root" }));
}
/**
 * Render a tab for an alternative schema.
 * It renders directly the properties if relevant;
 * for primitives, it renders the schema itself.
 */
function OpenAPISchemaAlternative(props) {
    const { schema, circularRefs, context } = props;
    const id = useId();
    const subProperties = getSchemaProperties(schema);
    return (React.createElement(OpenAPISchemaProperties, { id: id, properties: subProperties ?? [{ schema }], circularRefs: subProperties ? new Map(circularRefs).set(schema, id) : circularRefs, context: context }));
}
/**
 * Render a circular reference to a schema.
 */
function OpenAPISchemaCircularRef(props) {
    const { id, schema } = props;
    return (React.createElement("div", { className: "openapi-schema-circular" },
        "Circular reference to ",
        React.createElement("a", { href: `#${id}` }, getSchemaTitle(schema)),
        ' ',
        React.createElement("span", { className: "openapi-schema-circular-glyph" }, "\u21A9")));
}
/**
 * Render the enum value for a schema.
 */
export function OpenAPISchemaEnum(props) {
    const { enumValues } = props;
    return (React.createElement("div", { className: "openapi-schema-enum" }, enumValues.map((value, index) => (React.createElement("span", { key: index, className: "openapi-schema-enum-value" }, `${value}`)))));
}
/**
 * Get the sub-properties of a schema.
 */
function getSchemaProperties(schema) {
    if (schema.allOf) {
        return schema.allOf.reduce((acc, subSchema) => {
            const properties = getSchemaProperties(noReference(subSchema)) ?? [
                {
                    schema: noReference(subSchema),
                },
            ];
            return [...acc, ...properties];
        }, []);
    }
    // check array AND schema.items as this is sometimes null despite what the type indicates
    if (schema.type === 'array' && !!schema.items) {
        const items = noReference(schema.items);
        const itemProperties = getSchemaProperties(items);
        if (itemProperties) {
            return itemProperties;
        }
        return [
            {
                propertyName: 'items',
                schema: items,
            },
        ];
    }
    if (schema.type === 'object' || schema.properties) {
        const result = [];
        if (schema.properties) {
            Object.entries(schema.properties).forEach(([propertyName, rawPropertySchema]) => {
                const propertySchema = noReference(rawPropertySchema);
                if (propertySchema.deprecated) {
                    return;
                }
                result.push({
                    propertyName,
                    required: Array.isArray(schema.required)
                        ? schema.required.includes(propertyName)
                        : undefined,
                    schema: propertySchema,
                });
            });
        }
        if (schema.additionalProperties) {
            const additionalProperties = noReference(schema.additionalProperties);
            result.push({
                propertyName: 'Other properties',
                schema: additionalProperties === true ? {} : additionalProperties,
            });
        }
        return result;
    }
    return null;
}
/**
 * Get the alternatives to display for a schema.
 */
export function getSchemaAlternatives(schema, ancestors = new Set()) {
    const downAncestors = new Set(ancestors).add(schema);
    if (schema.anyOf) {
        return [
            flattenAlternatives('anyOf', schema.anyOf.map(noReference), downAncestors),
            noReference(schema.discriminator),
        ];
    }
    if (schema.oneOf) {
        return [
            flattenAlternatives('oneOf', schema.oneOf.map(noReference), downAncestors),
            noReference(schema.discriminator),
        ];
    }
    if (schema.allOf) {
        // allOf is managed in `getSchemaProperties`
        return null;
    }
    return null;
}
function flattenAlternatives(alternativeType, alternatives, ancestors) {
    return alternatives.reduce((acc, alternative) => {
        if (!!alternative[alternativeType] && !ancestors.has(alternative)) {
            return [...acc, ...(getSchemaAlternatives(alternative, ancestors)?.[0] || [])];
        }
        return [...acc, alternative];
    }, []);
}
function getSchemaTitle(schema, 
/** If the title is inferred in a oneOf with discriminator, we can use it to optimize the title */
discriminator) {
    if (schema.title) {
        // If the schema has a title, use it
        return schema.title;
    }
    // Try using the discriminator
    if (discriminator && schema.properties) {
        const discriminatorProperty = noReference(schema.properties[discriminator.propertyName]);
        if (discriminatorProperty) {
            if (discriminatorProperty.enum) {
                return discriminatorProperty.enum.map((value) => value.toString()).join(' | ');
            }
        }
    }
    // Otherwise try to infer a nice title
    let type = 'any';
    if (schema.enum) {
        type = 'enum';
        // check array AND schema.items as this is sometimes null despite what the type indicates
    }
    else if (schema.type === 'array' && !!schema.items) {
        type = `array of ${getSchemaTitle(noReference(schema.items))}`;
    }
    else if (schema.type || schema.properties) {
        type = schema.type ?? 'object';
        if (schema.format) {
            type += ` (${schema.format})`;
        }
    }
    else if ('anyOf' in schema) {
        type = 'any of';
    }
    else if ('oneOf' in schema) {
        type = 'one of';
    }
    else if ('allOf' in schema) {
        type = 'all of';
    }
    else if ('not' in schema) {
        type = 'not';
    }
    if (SYMBOL_REF_RESOLVED in schema) {
        type = `${schema[SYMBOL_REF_RESOLVED]} (${type})`;
    }
    if (schema.nullable) {
        type = `nullable ${type}`;
    }
    return type;
}
