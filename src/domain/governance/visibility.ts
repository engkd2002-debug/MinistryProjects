import type { DemoRole, ResearchRecord } from '../research/models';

// Presentation consistency only: browser-held records and a local role selector
// cannot enforce production authorization. Every future API must authorize again.
export const isVisible = (record: ResearchRecord, role: DemoRole): boolean =>
  role !== 'viewer' || record.status === 'published';
export const visibleRecords = (records: readonly ResearchRecord[], role: DemoRole) =>
  records.filter((record) => isVisible(record, role));
export const findVisibleRecord = (records: readonly ResearchRecord[], id: string, role: DemoRole) =>
  records.find((record) => record.id === id && isVisible(record, role));
export const pruneSelection = (
  ids: readonly string[],
  records: readonly ResearchRecord[],
  role: DemoRole,
) => ids.filter((id) => !!findVisibleRecord(records, id, role));

export type DemoCapability = 'read' | 'author' | 'governance' | 'configure';
export const canDemo = (role: DemoRole, capability: DemoCapability) =>
  capability === 'read' ||
  (capability === 'author' && (role === 'editor' || role === 'admin')) ||
  (capability === 'governance' && (role === 'reviewer' || role === 'admin')) ||
  (capability === 'configure' && role === 'admin');
