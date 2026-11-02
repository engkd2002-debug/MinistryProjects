import { z } from 'zod';

export const statusSchema = z.enum([
  'draft',
  'entered',
  'review',
  'approved',
  'published',
  'rejected',
]);
export type ResearchStatus = z.infer<typeof statusSchema>;
export const demoRoleSchema = z.enum(['viewer', 'editor', 'reviewer', 'admin']);
export type DemoRole = z.infer<typeof demoRoleSchema>;
export type ContentLanguage = 'ar' | 'en';

// The DTO matches the supplied prototype. Raw strings are retained for lossless
// adapter compatibility; canonical presentation never needs to inspect this DTO.
export const rawResearchSchema = z.object({
  id: z.number().int().positive(),
  rid: z.string().min(1),
  title: z.string(),
  title_en: z.string().default(''),
  abs: z.string().default(''),
  abs_en: z.string().default(''),
  researcher: z.string(),
  co: z.string().default(''),
  gov: z.string(),
  city: z.string(),
  uni: z.string(),
  faculty: z.string(),
  dept: z.string(),
  spec: z.string(),
  branch: z.string(),
  type: z.string(),
  year: z.number().int(),
  status: statusSchema,
  kw: z.string().default(''),
  url: z.string().default(''),
  ex: z.record(z.string(), z.string()),
  audit: z.array(z.object({ t: z.string(), by: z.string(), a: z.string() })),
});
export type RawResearchRecord = z.infer<typeof rawResearchSchema>;

export interface LocalizedContent {
  ar: string;
  en: string;
}
export interface ResearchRecord {
  id: string;
  researchId: string;
  title: LocalizedContent;
  abstract: LocalizedContent;
  contributors: { main: string; co: string[] };
  affiliation: { university: string; faculty: string; department: string };
  location: { governorateId: string; city: string };
  subject: { specialty: string; branch: string };
  researchType: string;
  year: number;
  status: ResearchStatus;
  keywords: string[];
  sourceUrl: string | null;
  customValues: Record<string, string>;
  audit: { date: string; actorLabel: string; action: string }[];
  // Exact source text is retained so a future export adapter can round-trip it.
  legacyText: { keywords: string; coResearchers: string };
}

export interface CustomFieldDefinition {
  key: string;
  label: string;
  description: string;
  declaredType: 'select' | 'text' | 'number' | 'date' | 'multi';
  suggestedValues: string[];
  custom: boolean;
}

export const displayContent = (content: LocalizedContent, language: ContentLanguage) =>
  (language === 'en' ? content.en : content.ar) || content.ar || content.en;
