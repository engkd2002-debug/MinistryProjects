import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { useI18n } from '../../../shared/i18n';
import { Button, Drawer, EmptyState, Badge } from '../../../shared/ui';
import { displayContent, type ResearchRecord } from '../../../domain/research/models';
import { RecordListItem } from './MapLayers';
import { demoReferences } from '../../../data/demo/references';
export function MapRecordList({
  records,
  unlocatedIds,
  onRecord,
}: {
  records: readonly ResearchRecord[];
  unlocatedIds: Set<string>;
  onRecord: (id: string) => void;
}) {
  const { t, formatNumber } = useI18n();
  const [page, setPage] = useState(1);
  const fingerprint = records.map((r) => r.id).join(',');
  useEffect(() => setPage(1), [fingerprint]);
  return (
    <div className="geo-record-list">
      <p className="geo-help">{t('geo.listDescription')}</p>
      {!records.length ? (
        <EmptyState
          title={t('geo.none')}
          description={t('geo.noneHint')}
          icon={<BookOpen size={24} />}
        />
      ) : (
        records
          .slice(0, page * 25)
          .map((record) => (
            <RecordListItem
              key={record.id}
              record={record}
              unlocated={unlocatedIds.has(record.id)}
              onOpen={() => onRecord(record.id)}
            />
          ))
      )}
      {records.length > page * 25 && (
        <Button onClick={() => setPage((p) => p + 1)}>
          {t('geo.more', { n: formatNumber(records.length - page * 25) })}
        </Button>
      )}
    </div>
  );
}
export function MapRecordPreview({
  record,
  open,
  onClose,
  onKeyword,
}: {
  record: ResearchRecord | undefined;
  open: boolean;
  onClose: () => void;
  onKeyword: (word: string) => void;
}) {
  const { t, locale, formatNumber } = useI18n();
  const sourceUrl = (() => {
    try {
      const u = new URL(record?.sourceUrl || '');
      return ['http:', 'https:'].includes(u.protocol) ? u.href : null;
    } catch {
      return null;
    }
  })();
  const gov = demoReferences.governorates.find((g) => g.id === record?.location.governorateId);
  const city = demoReferences.cities.find(
    (c) =>
      c.governorate_id === record?.location.governorateId && c.name_ar === record?.location.city,
  );
  return (
    <Drawer
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={t('geo.preview')}
      description={t('geo.previewNote')}
    >
      {!record ? (
        <EmptyState title={t('geo.recordUnavailable')} />
      ) : (
        <article className="geo-record-preview">
          <Badge tone="accent">{t('geo.sample')}</Badge>
          <h2 dir="auto">{displayContent(record.title, locale)}</h2>
          <bdi className="geo-record-reference">{record.researchId}</bdi>
          {locale === 'en' && (!record.title.en || !record.abstract.en) && (
            <p className="geo-help">{t('geo.englishUnavailable')}</p>
          )}
          <dl>
            {[
              [t('geo.mainResearcher'), record.contributors.main],
              [t('geo.university'), record.affiliation.university],
              [t('geo.year'), formatNumber(record.year, { useGrouping: false })],
              [t('geo.specialty'), record.subject.specialty],
              [
                t('geo.type'),
                demoReferences.types.find((ty) => ty.name_ar === record.researchType)?.[
                  locale === 'en' ? 'name_en' : 'name_ar'
                ] || record.researchType,
              ],
              [
                t('geo.location'),
                [
                  gov?.[locale === 'en' ? 'name_en' : 'name_ar'] || record.location.governorateId,
                  city?.[locale === 'en' ? 'name_en' : 'name_ar'] || record.location.city,
                ]
                  .filter(Boolean)
                  .join(' · '),
              ],
            ].map(([title, value]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>
                  <bdi>{value || t('geo.emptyValue')}</bdi>
                </dd>
              </div>
            ))}
          </dl>
          <h3>{t('geo.abstract')}</h3>
          <p dir="auto">{displayContent(record.abstract, locale) || t('geo.emptyValue')}</p>
          <h3>{t('geo.keywords')}</h3>
          <div className="geo-keywords">
            {record.keywords.map((word) => (
              <button key={word} onClick={() => onKeyword(word)}>
                {word}
              </button>
            ))}
          </div>
          {sourceUrl && (
            <a
              className="geo-source-link"
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('geo.external')}
              <ArrowUpRight size={15} />
            </a>
          )}
          <p className="geo-help">{t('geo.registeredOnly')}</p>
        </article>
      )}
    </Drawer>
  );
}
