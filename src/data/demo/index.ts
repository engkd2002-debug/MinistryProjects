import projects from './projects.json';
import geometry from './geometry.json';
import provenance from './provenance.json';
import { adaptResearchRecord } from '../adapters/research';
import type { VectorGeometry } from '../../domain/geography/models';

export { demoReferences } from './references';
export const demoGeometry: VectorGeometry = geometry;
export const demoProvenance = provenance;
export const demoRawRecords = projects;
// Consumers obtain independent snapshots; do not mutate this canonical fixture.
export const createDemoRecords = () => projects.map(adaptResearchRecord);
