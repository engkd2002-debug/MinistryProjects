import { useCallback, useEffect, useState } from 'react';
import {
  createLocalResearchRepository,
  SNAPSHOT_STORAGE_KEY,
} from '../../../data/local/research-repository';
import type { ResearchSnapshot } from '../../../data/contracts/research-repository';
export type SnapshotState =
  | { status: 'loading' }
  | { status: 'error'; code: string }
  | { status: 'ready'; snapshot: ResearchSnapshot };
export function useResearchSnapshot() {
  const [state, setState] = useState<SnapshotState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  useEffect(() => {
    let current = true;
    setState({ status: 'loading' });
    let storage: Storage | null = null;
    try {
      storage = window.localStorage;
    } catch {
      /* repository reports unavailable */
    }
    void createLocalResearchRepository(storage)
      .getSnapshot()
      .then((result) => {
        if (current)
          setState(
            result.ok
              ? { status: 'ready', snapshot: result.data }
              : { status: 'error', code: result.error.code },
          );
      })
      .catch(() => {
        if (current) setState({ status: 'error', code: 'read-failed' });
      });
    const changed = (e: StorageEvent) => {
      if (e.key === SNAPSHOT_STORAGE_KEY || e.key === null) retry();
    };
    window.addEventListener('storage', changed);
    return () => {
      current = false;
      window.removeEventListener('storage', changed);
    };
  }, [attempt, retry]);
  return { state, retry };
}
