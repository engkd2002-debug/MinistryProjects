import { describe, expect, it } from 'vitest';
import {
  createLocalResearchRepository,
  SNAPSHOT_STORAGE_KEY,
  type StoragePort,
} from '../src/data/local/research-repository';
import { adaptResearchRecord, toLegacyRecord } from '../src/data/adapters/research';
import { demoRawRecords } from '../src/data/demo';

function memoryStorage(): StoragePort & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe('source DTO adapter', () => {
  it('round-trips every source field including exact keyword/co-author strings', () => {
    for (const record of demoRawRecords)
      expect(toLegacyRecord(adaptResearchRecord(record))).toEqual(record);
  });
  it('rejects unsupported statuses instead of crashing presentation later', () => {
    expect(() => adaptResearchRecord({ ...demoRawRecords[0], status: 'invented' })).toThrow();
  });
});

describe('versioned local snapshot infrastructure', () => {
  it('loads fresh deterministic fixtures without writing over the origin', async () => {
    const storage = memoryStorage();
    const result = await createLocalResearchRepository(storage).getSnapshot();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.records).toHaveLength(150);
      expect(result.data.source).toBe('fixture');
    }
    expect(storage.values.size).toBe(0);
  });
  it('round-trips an explicit snapshot write and increments revision', async () => {
    const storage = memoryStorage();
    const repository = createLocalResearchRepository(storage);
    const initial = await repository.getSnapshot();
    if (!initial.ok) throw new Error('Fixture load failed');
    const saved = await repository.saveSnapshot(initial.data);
    expect(saved.ok).toBe(true);
    const loaded = await repository.getSnapshot();
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.data.revision).toBe(1);
      expect(loaded.data.source).toBe('local');
      expect(loaded.data.records).toEqual(initial.data.records);
    }
  });
  it('keeps malformed data intact and refuses to overwrite it', async () => {
    const storage = memoryStorage();
    const repository = createLocalResearchRepository(storage);
    const valid = await repository.getSnapshot();
    if (!valid.ok) throw new Error('Fixture load failed');
    storage.values.set(SNAPSHOT_STORAGE_KEY, '{broken');
    expect(await repository.getSnapshot()).toMatchObject({
      ok: false,
      error: { code: 'corrupt-storage' },
    });
    expect(await repository.saveSnapshot(valid.data)).toMatchObject({
      ok: false,
      error: { code: 'corrupt-storage' },
    });
    expect(storage.values.get(SNAPSHOT_STORAGE_KEY)).toBe('{broken');
  });
  it('reports unsupported versions and invalid records without resetting', async () => {
    const storage = memoryStorage();
    const repository = createLocalResearchRepository(storage);
    storage.values.set(SNAPSHOT_STORAGE_KEY, JSON.stringify({ schemaVersion: 900 }));
    expect(await repository.getSnapshot()).toMatchObject({
      ok: false,
      error: { code: 'unsupported-version' },
    });
    storage.values.set(SNAPSHOT_STORAGE_KEY, JSON.stringify({ schemaVersion: 1 }));
    expect(await repository.getSnapshot()).toMatchObject({
      ok: false,
      error: { code: 'validation' },
    });
  });
  it('reports denied access and quota write failures truthfully', async () => {
    expect(await createLocalResearchRepository(null).getSnapshot()).toMatchObject({
      ok: false,
      error: { code: 'storage-unavailable' },
    });
    expect(
      await createLocalResearchRepository({
        getItem: () => {
          throw new Error('denied');
        },
        setItem: () => {},
      }).getSnapshot(),
    ).toMatchObject({ ok: false, error: { code: 'storage-unavailable' } });
    const repository = createLocalResearchRepository({
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    });
    const initial = await repository.getSnapshot();
    if (!initial.ok) throw new Error('Fixture load failed');
    expect(await repository.saveSnapshot(initial.data)).toMatchObject({
      ok: false,
      error: { code: 'write-failed' },
    });
  });
  it('applies visibility again for record access rather than trusting cached IDs', async () => {
    const repository = createLocalResearchRepository(memoryStorage());
    const hidden = demoRawRecords.find((record) => record.status !== 'published')!;
    expect(await repository.getRecord(String(hidden.id), 'viewer')).toMatchObject({
      ok: false,
      error: { code: 'not-found' },
    });
    expect(await repository.getRecord(String(hidden.id), 'reviewer')).toMatchObject({ ok: true });
  });
});
