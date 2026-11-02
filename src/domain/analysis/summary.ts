import type { ResearchRecord } from '../research/models';

export function summarizeRecords(records: readonly ResearchRecord[]) {
  const names = records
    .flatMap((record) => [record.contributors.main, ...record.contributors.co])
    .filter(Boolean);
  return {
    records: records.length,
    // F16 correction: absent university is not a contributing institution.
    universities: new Set(records.map((record) => record.affiliation.university).filter(Boolean))
      .size,
    researcherNameStrings: new Set(names).size,
    governorates: new Set(records.map((record) => record.location.governorateId).filter(Boolean))
      .size,
    latestYear: records.length ? Math.max(...records.map((record) => record.year)) : null,
  };
}
