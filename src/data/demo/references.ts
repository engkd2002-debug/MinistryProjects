import references from './references.json';

// Lightweight reference boundary for shell/query consumers. Importing this file
// must not load project fixtures, SVG geometry, Zod or the record DTO adapter.
// Exact fixture provenance and frozen source-order identifiers are preserved.
export const demoReferences = references;
