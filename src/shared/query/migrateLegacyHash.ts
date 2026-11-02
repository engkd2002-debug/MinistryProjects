import { parseQuery, serializeQuery } from '../../domain/research/query';
import { demoReferences } from '../../data/demo/references';
/** One-time compatibility with prototype links. Anchor links are left alone. */
export function migrateLegacyHash(
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
  history: Pick<History, 'replaceState'>,
) {
  if (location.search || !location.hash.includes('=')) return false;
  const parsed = parseQuery(
    location.hash,
    demoReferences.governorates.map((g) => g.id),
  );
  const search = serializeQuery(parsed.query).toString();
  if (!search) return false;
  history.replaceState(null, '', `${location.pathname}?${search}`);
  return true;
}
