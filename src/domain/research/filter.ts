import type { Governorate } from '../geography/models';
import { isVisible } from '../governance/visibility';
import type { ContentLanguage, DemoRole, ResearchRecord } from './models';
import type { QueryKey, QueryState } from './query';

export const normalizeArabic = (input: unknown): string =>
  String(input ?? '')
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');

function categoryValue(record: ResearchRecord, category: string): string {
  const values: Record<string, string | number> = {
    city: record.location.city,
    gov: record.location.governorateId,
    uni: record.affiliation.university,
    spec: record.subject.specialty,
    branch: record.subject.branch,
    year: record.year,
    researcher: record.contributors.main,
  };
  return String(values[category] ?? record.customValues[category] ?? '');
}

export interface FilterContext {
  role: DemoRole;
  language?: ContentLanguage;
  governorates?: readonly Governorate[];
  skip?: QueryKey;
}

export function matchesQuery(
  record: ResearchRecord,
  query: QueryState,
  context: FilterContext,
): boolean {
  if (!isVisible(record, context.role)) return false;
  const { skip } = context;
  const exact: [QueryKey, string][] = [
    ['gov', record.location.governorateId],
    ['city', record.location.city],
    ['uni', record.affiliation.university],
    ['spec', record.subject.specialty],
    ['branch', record.subject.branch],
    ['type', record.researchType],
  ];
  for (const [key, value] of exact)
    if (skip !== key && query[key] && query[key] !== value) return false;
  if (skip !== 'yr' && query.yr.length && !query.yr.includes(String(record.year))) return false;
  if (skip !== 'yf' && query.yf && record.year < Number(query.yf)) return false;
  if (skip !== 'yt' && query.yt && record.year > Number(query.yt)) return false;
  if (
    skip !== 'kw' &&
    query.kw &&
    !normalizeArabic(record.legacyText.keywords).includes(normalizeArabic(query.kw))
  )
    return false;
  if (
    skip !== 'cat' &&
    skip !== 'catv' &&
    query.cat &&
    query.catv &&
    categoryValue(record, query.cat) !== query.catv
  )
    return false;
  // Explicit Phase 1 F09 repair: the original independent researcher field was
  // inert. Explorer now exposes this predicate; Operations reuses it in Phase 4.
  if (
    skip !== 'res' &&
    query.res &&
    !normalizeArabic([record.contributors.main, ...record.contributors.co].join(' ')).includes(
      normalizeArabic(query.res),
    )
  )
    return false;
  if (skip !== 'q' && query.q.trim()) {
    const governorate = context.governorates?.find((g) => g.id === record.location.governorateId);
    const body = normalizeArabic(
      [
        record.title.ar,
        record.title.en,
        record.contributors.main,
        record.legacyText.coResearchers,
        record.affiliation.university,
        record.subject.specialty,
        record.subject.branch,
        record.legacyText.keywords,
        record.abstract.ar,
        record.location.city,
        governorate?.name_ar,
        governorate?.name_en,
        record.location.governorateId,
      ].join(' '),
    );
    if (
      !query.q
        .trim()
        .split(/\s+/)
        .every((term) => body.includes(normalizeArabic(term)))
    )
      return false;
  }
  return true;
}

export const filterRecords = (
  records: readonly ResearchRecord[],
  query: QueryState,
  context: FilterContext,
) => records.filter((record) => matchesQuery(record, query, context));
