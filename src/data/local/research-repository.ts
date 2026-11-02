import { z } from 'zod';
import { rawResearchSchema } from '../../domain/research/models';
import { findVisibleRecord } from '../../domain/governance/visibility';
import { adaptResearchRecord, toLegacyRecord } from '../adapters/research';
import { createDemoRecords, demoProvenance } from '../demo';
import type {
  DataErrorCode,
  DataResult,
  ResearchSnapshot,
  SnapshotPersistence,
} from '../contracts/research-repository';

export const SNAPSHOT_STORAGE_KEY = 'snrp.snapshot.v1';
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
const envelopeSchema = z.object({
  schemaVersion: z.literal(1),
  revision: z.number().int().nonnegative(),
  savedAt: z.string().datetime(),
  fixtureVersion: z.string(),
  synthetic: z.literal(true),
  records: z.array(rawResearchSchema),
});
const fail = <T>(code: DataErrorCode, message: string): DataResult<T> => ({
  ok: false,
  error: { code, message, recoverable: true },
});
const initialSnapshot = (): ResearchSnapshot => ({
  schemaVersion: 1,
  revision: 0,
  source: 'fixture',
  fixtureVersion: demoProvenance.fixtureVersion,
  synthetic: true,
  records: createDemoRecords(),
  savedAt: null,
});

export function createLocalResearchRepository(storage: StoragePort | null): SnapshotPersistence {
  async function getSnapshot(): Promise<DataResult<ResearchSnapshot>> {
    if (!storage)
      return fail(
        'storage-unavailable',
        'Local storage is unavailable. No saved data was replaced.',
      );
    let value: string | null;
    try {
      value = storage.getItem(SNAPSHOT_STORAGE_KEY);
    } catch {
      return fail('storage-unavailable', 'The browser denied access to saved data.');
    }
    if (value === null) return { ok: true, data: initialSnapshot() };
    let json: unknown;
    try {
      json = JSON.parse(value);
    } catch {
      return fail(
        'corrupt-storage',
        'Saved data could not be read. Keep it intact and use deliberate recovery.',
      );
    }
    if (typeof json !== 'object' || json === null || !('schemaVersion' in json))
      return fail('corrupt-storage', 'Saved data has no recognized envelope.');
    if (json.schemaVersion !== 1)
      return fail('unsupported-version', 'This saved-data version requires an explicit migration.');
    const parsed = envelopeSchema.safeParse(json);
    if (!parsed.success)
      return fail(
        'validation',
        'Saved data does not match the supported schema. It was not reset.',
      );
    if (new Set(parsed.data.records.map((record) => record.id)).size !== parsed.data.records.length)
      return fail('validation', 'Saved data contains repeated record identifiers.');
    return {
      ok: true,
      data: {
        schemaVersion: 1,
        revision: parsed.data.revision,
        source: 'local',
        fixtureVersion: parsed.data.fixtureVersion,
        synthetic: true,
        records: parsed.data.records.map(adaptResearchRecord),
        savedAt: parsed.data.savedAt,
      },
    };
  }

  return {
    getSnapshot,
    async getRecord(id, demoRole) {
      const result = await getSnapshot();
      if (!result.ok) return result;
      const record = findVisibleRecord(result.data.records, id, demoRole);
      return record
        ? { ok: true, data: record }
        : fail('not-found', 'This record is unavailable in the current demo role or dataset.');
    },
    async saveSnapshot(snapshot) {
      if (!storage)
        return fail(
          'storage-unavailable',
          'Local storage is unavailable. The changes are not saved.',
        );
      // Do not let an infrastructure write silently overwrite corrupt or
      // unknown-version user data. Recovery/migrations require explicit intent.
      const previous = await getSnapshot();
      if (!previous.ok) return previous;
      let envelope: z.infer<typeof envelopeSchema>;
      try {
        envelope = envelopeSchema.parse({
          schemaVersion: 1,
          revision: snapshot.revision + 1,
          savedAt: new Date().toISOString(),
          fixtureVersion: snapshot.fixtureVersion,
          synthetic: true,
          records: snapshot.records.map(toLegacyRecord),
        });
        if (new Set(envelope.records.map((record) => record.id)).size !== envelope.records.length)
          return fail('validation', 'Record identifiers must be unique.');
      } catch {
        return fail('validation', 'Changes do not match the supported data schema.');
      }
      try {
        storage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(envelope));
      } catch {
        return fail(
          'write-failed',
          'The browser could not save changes. Keep unsaved work and retry.',
        );
      }
      return {
        ok: true,
        data: {
          ...snapshot,
          revision: envelope.revision,
          savedAt: envelope.savedAt,
          source: 'local',
        },
      };
    },
  };
}
