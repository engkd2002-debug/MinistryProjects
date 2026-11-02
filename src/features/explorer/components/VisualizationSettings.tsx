import { useEffect, useState } from 'react';
import { useI18n } from '../../../shared/i18n';
import { Button, Switch, Disclosure, Field, Input, Select, Alert, Table } from '../../../shared/ui';
import {
  validThresholds,
  type CountThresholds,
  type CollaborationLink,
} from '../../../domain/geography/aggregation';
import type { DemoRole } from '../../../domain/research/models';
import { useExplorerSession } from '../state/ExplorerSession';
export function VisualizationSettings({
  thresholds,
  links,
}: {
  thresholds: CountThresholds;
  links: CollaborationLink[];
}) {
  const { t, formatNumber } = useI18n();
  const s = useExplorerSession();
  const [values, setValues] = useState(thresholds.map(String));
  const [error, setError] = useState(false);
  useEffect(() => setValues(thresholds.map(String)), [thresholds]);
  return (
    <div className="geo-visual-settings">
      <p className="geo-help">{t('geo.countNote')}</p>
      {(['heat', 'gaps', 'collaboration'] as const).map((key) => (
        <div className="geo-layer-setting" key={key}>
          <Switch
            label={t(`geo.${key}`)}
            checked={s.layers[key]}
            onCheckedChange={() => s.toggleLayer(key)}
          />
          <p>{t(`geo.${key}Note`)}</p>
        </div>
      ))}
      <section aria-label={t('geo.legend')} className="geo-detailed-legend">
        <h3>{t('geo.legend')}</h3>
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <i style={{ background: `var(--map-cluster-${i + 1})` }} />
            <span>
              {t(i === 0 ? 'geo.classFirst' : i === 3 ? 'geo.classLast' : 'geo.class1', {
                min: formatNumber(i === 0 ? 1 : thresholds[i - 1]),
                max: formatNumber(i === 0 ? thresholds[0] : thresholds[i] - 1),
              })}
            </span>
          </div>
        ))}
        <div>
          <i className="legend-hatch" />
          <span>{t('geo.noMatchesLegend')}</span>
        </div>
        <div>
          <i className="legend-unknown" />
          <span>{t('geo.unknownLegend')}</span>
        </div>
        <p>{t('geo.anchorNote')}</p>
        <p>{t('geo.sampled')}</p>
      </section>
      <Disclosure title={t('geo.thresholds')}>
        <p className="geo-help">{t('geo.thresholdHint')}</p>
        <div className="geo-threshold-fields">
          {values.map((v, i) => (
            <Field key={i} label={t(`geo.threshold${i + 1}`)} htmlFor={`threshold-${i}`}>
              <Input
                id={`threshold-${i}`}
                type="number"
                min="1"
                step="1"
                value={v}
                onChange={(e) => setValues((a) => a.map((x, n) => (n === i ? e.target.value : x)))}
              />
            </Field>
          ))}
        </div>
        {error && <Alert tone="danger" title={t('geo.thresholdError')} />}
        <div className="geo-button-row">
          <Button
            size="sm"
            onClick={() => {
              const numbers = values.map(Number);
              const valid = values.every(Boolean) && validThresholds(numbers);
              setError(!valid);
              if (valid) s.setThresholds(numbers as CountThresholds);
            }}
          >
            {t('geo.applyThresholds')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              s.setThresholds(null);
              setError(false);
            }}
          >
            {t('geo.autoThresholds')}
          </Button>
        </div>
      </Disclosure>
      {s.layers.collaboration && (
        <Disclosure title={t('geo.linksTable')}>
          {links.length ? (
            <Table
              caption={t('geo.collaborationNote')}
              columns={[
                { key: 'a', label: t('geo.universityA') },
                { key: 'b', label: t('geo.universityB') },
                { key: 'weight', label: t('geo.matchNames') },
              ]}
              rows={links.map((l) => ({
                a: <bdi>{l.a}</bdi>,
                b: <bdi>{l.b}</bdi>,
                weight: formatNumber(l.weight),
              }))}
            />
          ) : (
            <p>{t('geo.noLinks')}</p>
          )}
        </Disclosure>
      )}
      <Disclosure title={t('geo.role')}>
        <p className="geo-help">{t('geo.roleHint')}</p>
        <Field label={t('geo.role')} htmlFor="geo-role">
          <Select
            id="geo-role"
            value={s.role}
            onChange={(e) => s.setRole(e.target.value as DemoRole)}
          >
            {(['viewer', 'editor', 'reviewer', 'admin'] as const).map((r) => (
              <option key={r} value={r}>
                {t(`geo.${r}`)}
              </option>
            ))}
          </Select>
        </Field>
        {s.roleStorageError && <Alert tone="warning" title={t('geo.roleError')} />}
      </Disclosure>
    </div>
  );
}
