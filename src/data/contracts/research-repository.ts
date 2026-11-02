import type { DemoRole, ResearchRecord } from '../../domain/research/models';

export interface ResearchSnapshot {
  schemaVersion: 1;
  revision: number;
  source: 'fixture' | 'local';
  fixtureVersion: string;
  synthetic: true;
  records: ResearchRecord[];
  savedAt: string | null;
}
export type DataErrorCode =
  | 'storage-unavailable'
  | 'corrupt-storage'
  | 'unsupported-version'
  | 'validation'
  | 'write-failed'
  | 'not-found';
export interface DataError {
  code: DataErrorCode;
  message: string;
  recoverable: boolean;
}
export type DataResult<T> = { ok: true; data: T } | { ok: false; error: DataError };

export interface ResearchRepository {
  getSnapshot(): Promise<DataResult<ResearchSnapshot>>;
  getRecord(id: string, demoRole: DemoRole): Promise<DataResult<ResearchRecord>>;
}

// Future authoring/import command services consume this repository boundary.
// Phase 2 does not expose create/edit/import/publish commands or UI.
export interface SnapshotPersistence extends ResearchRepository {
  saveSnapshot(snapshot: ResearchSnapshot): Promise<DataResult<ResearchSnapshot>>;
}
