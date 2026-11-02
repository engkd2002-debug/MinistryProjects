import { useMemo, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { demoReferences } from '../../data/demo/references';
import {
  emptyQuery,
  getActiveFilters,
  parseQuery,
  removeFilter,
  serializeQuery,
  updateFilter,
  type QueryKey,
  type QueryState,
} from '../../domain/research/query';

const governorateIds = demoReferences.governorates.map((governorate) => governorate.id);

/** URL is the only query authority: route links must preserve location.search.
 * Back/Forward, refresh and a copied query resolve through the same codec.
 * Replace keystroke edits; commit facets as history entries.
 */
export function useQueryState() {
  const [parameters, setParameters] = useSearchParams();
  const location = useLocation();
  const serialized = parameters.toString();
  const { query, diagnostics } = useMemo(
    () => parseQuery(serialized, governorateIds),
    [serialized],
  );
  // React Router's search-parameter callbacks do not queue like React state.
  // Compose writes synchronously so two controls changed before the next route
  // render do not discard each other's values. Rendering still reads only URL
  // state; every observed URL change (including Back/Forward) resets this queue.
  const observed = `${location.key}?${serialized}`;
  const pending = useRef({ observed, query });
  if (pending.current.observed !== observed) pending.current = { observed, query };
  function commit(next: QueryState, replace = false) {
    pending.current.query = next;
    setParameters(serializeQuery(next), { replace });
  }
  function setFilter<K extends QueryKey>(key: K, value: QueryState[K]) {
    commit(
      updateFilter(pending.current.query, key, value, demoReferences.cities),
      ['q', 'res', 'kw', 'yf', 'yt'].includes(key),
    );
  }
  function setFilters(values: Partial<QueryState>) {
    let next = pending.current.query;
    for (const key of Object.keys(values) as QueryKey[]) {
      const value = values[key];
      if (value !== undefined) next = updateFilter(next, key, value, demoReferences.cities);
    }
    commit(next);
  }
  function clearFilter(key: QueryKey) {
    commit(removeFilter(pending.current.query, key));
  }
  function reset() {
    commit(emptyQuery());
  }
  return {
    query,
    setFilter,
    setFilters,
    clearFilter,
    reset,
    activeFilters: getActiveFilters(query),
    diagnostics,
  };
}
