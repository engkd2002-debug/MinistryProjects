import {
  rawResearchSchema,
  type RawResearchRecord,
  type ResearchRecord,
} from '../../domain/research/models';

export function adaptResearchRecord(input: unknown): ResearchRecord {
  const source = rawResearchSchema.parse(input);
  return {
    id: String(source.id),
    researchId: source.rid,
    title: { ar: source.title, en: source.title_en },
    abstract: { ar: source.abs, en: source.abs_en },
    contributors: {
      main: source.researcher,
      co: source.co
        .split(/[,،]/)
        .map((s) => s.trim())
        .filter(Boolean),
    },
    affiliation: { university: source.uni, faculty: source.faculty, department: source.dept },
    location: { governorateId: source.gov, city: source.city },
    subject: { specialty: source.spec, branch: source.branch },
    researchType: source.type,
    year: source.year,
    status: source.status,
    keywords: source.kw
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean),
    sourceUrl: source.url || null,
    customValues: { ...source.ex },
    audit: source.audit.map((a) => ({ date: a.t, actorLabel: a.by, action: a.a })),
    legacyText: { keywords: source.kw, coResearchers: source.co },
  };
}

export function toLegacyRecord(record: ResearchRecord): RawResearchRecord {
  return {
    id: Number(record.id),
    rid: record.researchId,
    title: record.title.ar,
    title_en: record.title.en,
    abs: record.abstract.ar,
    abs_en: record.abstract.en,
    researcher: record.contributors.main,
    co: record.legacyText.coResearchers,
    gov: record.location.governorateId,
    city: record.location.city,
    uni: record.affiliation.university,
    faculty: record.affiliation.faculty,
    dept: record.affiliation.department,
    spec: record.subject.specialty,
    branch: record.subject.branch,
    type: record.researchType,
    year: record.year,
    status: record.status,
    kw: record.legacyText.keywords,
    url: record.sourceUrl || '',
    ex: { ...record.customValues },
    audit: record.audit.map((a) => ({ t: a.date, by: a.actorLabel, a: a.action })),
  };
}
