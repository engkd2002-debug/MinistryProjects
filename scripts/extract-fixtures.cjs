/* Rebuild immutable Phase 1 fixtures from the exact audited attachment.
 * Only hash-pinned, known declaration sections are evaluated in an isolated VM.
 * The HTML application, DOM handlers, storage and external scripts never execute.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'docs/sources/syria-research-observatory_v2_prototype.html'),
  'utf8',
);
const expected = '3ec5d7338ce583e643ec3d1c7fec0566a0238959abcd451e42a29af9c88da44c';
if (createHash('sha256').update(source).digest('hex') !== expected)
  throw new Error('Source changed. Audit and update provenance explicitly before extracting.');
const lines = source.split('\n');
const declaration = (name) => lines.find((line) => line.startsWith(`const ${name}=`));
const geometry = JSON.parse(declaration('GEO').slice('const GEO='.length, -1));
const references = lines.slice(115, 124).join('\n');
const generator = lines.slice(125, 131).join('\n');
const categoryExpression = lines[131].split("CATS=ld('cats',null)||")[1].replace(/;$/, '');
const script = `${references}\n${generator}\n${declaration('CON')}\nJSON.stringify({projects:mkSeed(),govs:GOVS,cities:CITIES,universities:UNIS,specialties:SPEC,types:TYPES,statuses:STAT,categories:${categoryExpression},synonyms:CON})`;
const result = JSON.parse(vm.runInNewContext(script, Object.create(null), { timeout: 1000 }));
const directory = path.join(root, 'src/data/demo');
fs.mkdirSync(directory, { recursive: true });
const write = (name, data) =>
  fs.writeFileSync(path.join(directory, name), JSON.stringify(data, null, 2) + '\n');
write('projects.json', result.projects);
write('geometry.json', geometry);
write('references.json', {
  governorates: result.govs.map(([id, name_ar, name_en, lon, lat]) => ({
    id,
    name_ar,
    name_en,
    lon,
    lat,
  })),
  cities: result.cities.map(([governorate_id, name_ar, name_en, lon, lat], i) => ({
    id: `C${String(i + 1).padStart(3, '0')}`,
    governorate_id,
    name_ar,
    name_en,
    lon,
    lat,
  })),
  universities: result.universities.map(([name_ar, city], i) => ({
    id: `U${String(i + 1).padStart(3, '0')}`,
    name_ar,
    city,
  })),
  specialties: Object.entries(result.specialties).map(([name_ar, [faculty, branches]], i) => ({
    id: `S${String(i + 1).padStart(2, '0')}`,
    name_ar,
    faculty,
    branches,
  })),
  types: result.types.map((v, i) => ({
    id: `T${String(i + 1).padStart(2, '0')}`,
    name_ar: v.split('|')[0],
    name_en: v.split('|')[1],
  })),
  statuses: result.statuses.map((v) => ({ id: v.split('|')[0], name_ar: v.split('|')[1] })),
  categories: result.categories,
  synonyms: result.synonyms.map(([concept, terms]) => ({ concept, terms })),
});
write('provenance.json', {
  source: 'docs/sources/syria-research-observatory_v2_prototype.html',
  sha256: expected,
  fixtureVersion: 'prototype-v2-seed-11',
  seed: 11,
  synthetic: true,
  officialStatistics: false,
  coordinatesVerified: false,
  referenceIds:
    'Frozen positional mapping from the exact source order; never regenerate by display-name sort.',
  recordCount: result.projects.length,
});
console.log(
  `Extracted ${result.projects.length} synthetic records, reference dictionaries and supplied SVG geometry.`,
);
