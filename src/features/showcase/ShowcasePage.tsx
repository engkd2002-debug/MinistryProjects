import { useRef, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Layers3,
  SlidersHorizontal,
  Sparkles,
  SquareDashed,
  Type,
  WandSparkles,
} from 'lucide-react';
import { useI18n } from '../../shared/i18n';
import { motionTokens } from '../../shared/motion';
import {
  Alert,
  Badge,
  Button,
  Card,
  ChartFrame,
  Checkbox,
  ComparisonIndicator,
  Dialog,
  Disclosure,
  Divider,
  Drawer,
  EmptyState,
  Field,
  FilterChip,
  IconButton,
  Input,
  Legend,
  Metric,
  Panel,
  Popover,
  Select,
  Skeleton,
  Switch,
  Table,
  Tabs,
  Textarea,
  Tooltip,
  useToast,
} from '../../shared/ui';
import './showcase.css';

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <header className="spec-section-heading">
      <span className="spec-section-number" aria-hidden="true">
        {number}
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}

export function ShowcasePage() {
  const { t } = useI18n();
  const { notify } = useToast();
  const [checked, setChecked] = useState(true);
  const [guidance, setGuidance] = useState(false);
  const [title, setTitle] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validated, setValidated] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chip, setChip] = useState(true);
  const [motionKey, setMotionKey] = useState(0);
  const titleInput = useRef<HTMLInputElement>(null);
  const error = submitted && !title.trim() ? t('showcase.required') : undefined;
  const validate = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setValidated(Boolean(title.trim()));
    if (!title.trim()) titleInput.current?.focus();
    else notify(t('showcase.validated'), 'success');
  };

  return (
    <div className="showcase-page">
      <header className="spec-hero">
        <div className="spec-hero-main">
          <span className="spec-eyebrow">
            <span className="spec-line" />
            {t('showcase.eyebrow')}
          </span>
          <h1 tabIndex={-1} id="page-heading">
            {t('showcase.title')}
          </h1>
          <p>{t('showcase.description')}</p>
        </div>
        <div className="spec-hero-meta">
          <Badge tone="accent">{t('showcase.internal')}</Badge>
          <span>{t('showcase.version')}</span>
          <div className="spec-hero-mark" aria-hidden="true">
            <Layers3 size={40} strokeWidth={1} />
            <span>02</span>
          </div>
        </div>
      </header>

      <nav className="spec-anchor-nav" aria-label={t('showcase.internal')}>
        <a href="#foundations">
          <span>01</span>
          {t('showcase.foundation')}
        </a>
        <a href="#controls">
          <span>02</span>
          {t('showcase.controls')}
        </a>
        <a href="#layers">
          <span>03</span>
          {t('showcase.overlays')}
        </a>
        <a href="#data">
          <span>04</span>
          {t('showcase.data')}
        </a>
      </nav>

      <section id="foundations" className="spec-section">
        <SectionHeading
          number="01"
          title={t('showcase.foundation')}
          description={t('showcase.foundationDescription')}
        />
        <div className="spec-foundation-grid">
          <Panel className="spec-type-panel">
            <div className="spec-panel-overline">
              <Type size={16} />
              <span>{t('showcase.typeLabel')}</span>
            </div>
            <h3>{t('showcase.typeTitle')}</h3>
            <p className="spec-panel-description">{t('showcase.typeDescription')}</p>
            <div className="spec-type-scale">
              <div>
                <span className="spec-type-step">01 / H1</span>
                <strong className="spec-type-h1">{t('showcase.typeHeading')}</strong>
              </div>
              <div>
                <span className="spec-type-step">02 / BODY</span>
                <p>{t('showcase.typeBody')}</p>
              </div>
              <div>
                <span className="spec-type-step">03 / META</span>
                <span className="spec-type-caption">{t('showcase.typeCaption')}</span>
              </div>
            </div>
            <Divider />
            <div className="spec-mixed-text">
              <span>{t('showcase.mixed')}</span>
              <p>
                <bdi>{t('showcase.mixedTitle')}</bdi>
              </p>
              <small>{t('showcase.mixedHint')}</small>
            </div>
          </Panel>
          <div className="spec-palette-panel">
            <h3>{t('showcase.colorsTitle')}</h3>
            <p className="spec-panel-description">{t('showcase.colorsDescription')}</p>
            <div className="spec-brand-palette">
              {[
                ['navy', 'navy', '#0F172A'],
                ['teal', 'teal', '#0C9488'],
                ['cyan', 'cyan', '#38BDF8'],
              ].map(([color, key, code]) => (
                <div className={`spec-swatch spec-swatch-${color}`} key={key}>
                  <div aria-hidden="true" />
                  <strong>{t(`showcase.${key}`)}</strong>
                  <code>{code}</code>
                </div>
              ))}
            </div>
            <div className="spec-surface-stack">
              <div className="spec-surface-base">
                <span>{t('showcase.canvas')}</span>
                <div className="spec-surface-mid">
                  <span>{t('showcase.surface')}</span>
                  <div className="spec-surface-top">
                    <Layers3 size={17} />
                    <span>{t('showcase.elevated')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="controls" className="spec-section">
        <SectionHeading
          number="02"
          title={t('showcase.controls')}
          description={t('showcase.controlsDescription')}
        />
        <div className="spec-controls-grid">
          <div className="spec-controls-specimens">
            <Card className="spec-card-pad">
              <h3>{t('showcase.actions')}</h3>
              <div className="spec-button-row">
                <Button
                  variant="primary"
                  icon={<ArrowUpRight size={16} />}
                  onClick={() => notify(t('showcase.notification'))}
                >
                  {t('showcase.primary')}
                </Button>
                <Button variant="secondary" onClick={() => notify(t('showcase.notification'))}>
                  {t('showcase.secondary')}
                </Button>
                <Button variant="ghost" onClick={() => notify(t('showcase.notification'))}>
                  {t('showcase.quiet')}
                </Button>
              </div>
              <div className="spec-button-row">
                <Button variant="secondary" disabled>
                  {t('showcase.disabled')}
                </Button>
                <Button loading>{t('showcase.loading')}</Button>
                <Tooltip content={t('showcase.tooltip')}>
                  <IconButton
                    label={t('showcase.tooltip')}
                    onClick={() => notify(t('showcase.notification'))}
                  >
                    <SlidersHorizontal size={17} />
                  </IconButton>
                </Tooltip>
              </div>
            </Card>
            <Card className="spec-card-pad">
              <h3>{t('showcase.selections')}</h3>
              <div className="spec-choice-list">
                <Checkbox
                  label={t('showcase.checkbox')}
                  checked={checked}
                  onChange={(event) => setChecked(event.target.checked)}
                />
                <Switch
                  label={t('showcase.switch')}
                  checked={guidance}
                  onCheckedChange={setGuidance}
                />
              </div>
              {guidance && (
                <p className="spec-inline-guidance" role="status">
                  {t('showcase.guidance')}
                </p>
              )}
              <Divider />
              <div className="spec-badge-row">
                <Badge tone="neutral">{t('showcase.disabled')}</Badge>
                <Badge tone="accent">{t('showcase.ready')}</Badge>
                <Badge tone="success">{t('showcase.successTitle')}</Badge>
                <Badge tone="warning">{t('showcase.warningTitle')}</Badge>
              </div>
            </Card>
          </div>
          <Panel className="spec-form-panel">
            <div className="spec-panel-overline">
              <SquareDashed size={16} />
              <span>{t('showcase.formTitle')}</span>
            </div>
            <h3>{t('showcase.formTitle')}</h3>
            <p className="spec-panel-description">{t('showcase.formDescription')}</p>
            <form noValidate onSubmit={validate}>
              <Field label={t('showcase.recordTitle')} hint={t('showcase.titleHint')} error={error}>
                <Input
                  ref={titleInput}
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setValidated(false);
                  }}
                  placeholder={t('showcase.titlePlaceholder')}
                  required
                />
              </Field>
              <Field label={t('showcase.specialty')}>
                <Select value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
                  <option value="">{t('showcase.choose')}</option>
                  <option value="engineering">{t('showcase.engineering')}</option>
                  <option value="science">{t('showcase.science')}</option>
                </Select>
              </Field>
              <Field label={t('showcase.note')}>
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={t('showcase.notePlaceholder')}
                  rows={3}
                />
              </Field>
              <Button variant="primary" type="submit" icon={<Check size={16} />}>
                {t('showcase.validate')}
              </Button>
              {validated && (
                <p className="spec-validation-success" role="status">
                  {t('showcase.validated')}
                </p>
              )}
            </form>
          </Panel>
        </div>
      </section>

      <section id="layers" className="spec-section">
        <SectionHeading
          number="03"
          title={t('showcase.overlays')}
          description={t('showcase.layersDescription')}
        />
        <div className="spec-layer-grid">
          <Panel className="spec-card-pad spec-layer-panel">
            <div className="spec-layer-diagram" aria-hidden="true">
              <span />
              <span />
              <span />
              <Layers3 size={27} strokeWidth={1.2} />
            </div>
            <div className="spec-overlay-actions">
              <Dialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title={t('showcase.dialogTitle')}
                description={t('showcase.dialogBody')}
                trigger={<Button variant="secondary">{t('showcase.openDialog')}</Button>}
                footer={
                  <Button onClick={() => setDialogOpen(false)}>{t('showcase.confirm')}</Button>
                }
              >
                <p>{t('showcase.formDescription')}</p>
              </Dialog>
              <Drawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                title={t('showcase.drawerTitle')}
                description={t('showcase.drawerDescription')}
                trigger={<Button variant="secondary">{t('showcase.openDrawer')}</Button>}
                footer={
                  <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
                    {t('showcase.close')}
                  </Button>
                }
              >
                <div className="spec-drawer-content">
                  <Layers3 size={30} />
                  <p>{t('showcase.drawerBody')}</p>
                  <Alert tone="info" title={t('showcase.drawerNote')} />
                </div>
              </Drawer>
              <Popover
                label={t('showcase.popoverTitle')}
                trigger={
                  <Button variant="ghost" icon={<ChevronRight size={16} />}>
                    {t('showcase.openPopover')}
                  </Button>
                }
              >
                <h3>{t('showcase.popoverTitle')}</h3>
                <p>{t('showcase.popoverBody')}</p>
              </Popover>
            </div>
            <Tabs
              label={t('showcase.overlays')}
              defaultValue="pattern"
              items={[
                {
                  value: 'pattern',
                  label: t('showcase.tabOverview'),
                  content: <p>{t('showcase.layerPattern')}</p>,
                },
                {
                  value: 'behavior',
                  label: t('showcase.tabBehavior'),
                  content: <p>{t('showcase.layerBehavior')}</p>,
                },
              ]}
            />
            <Disclosure title={t('showcase.disclosure')}>
              <p>{t('showcase.disclosureBody')}</p>
            </Disclosure>
          </Panel>
          <div className="spec-feedback-stack">
            <h3>{t('showcase.notifications')}</h3>
            <Alert tone="success" title={t('showcase.successTitle')}>
              {t('showcase.successDescription')}
            </Alert>
            <Alert tone="warning" title={t('showcase.warningTitle')}>
              {t('showcase.warningDescription')}
            </Alert>
            <Alert tone="danger" title={t('showcase.errorTitle')}>
              {t('showcase.errorDescription')}
            </Alert>
            <Button
              variant="ghost"
              icon={<Sparkles size={16} />}
              onClick={() => notify(t('showcase.notification'), 'success')}
            >
              {t('showcase.notify')}
            </Button>
          </div>
        </div>
      </section>

      <section id="data" className="spec-section">
        <SectionHeading
          number="04"
          title={t('showcase.data')}
          description={t('showcase.dataDescription')}
        />
        <div className="spec-data-grid">
          <div className="spec-data-column">
            <Card className="spec-metric-card">
              <Metric
                label={t('showcase.metric')}
                value="—"
                description={t('showcase.metricNote')}
              />
              <div className="spec-specimen-corner" aria-hidden="true">
                Aa
              </div>
            </Card>
            <ChartFrame
              title={t('showcase.chartTitle')}
              description={t('showcase.chartDescription')}
              footer={
                <Legend
                  items={[
                    { label: t('showcase.legendPrimary'), color: 'var(--accent)' },
                    { label: t('showcase.legendSecondary'), color: 'var(--info)' },
                  ]}
                />
              }
            >
              <EmptyState
                icon={<SquareDashed size={26} />}
                title={t('showcase.noValues')}
                description={t('showcase.noValuesDescription')}
              />
            </ChartFrame>
          </div>
          <Panel className="spec-card-pad">
            <h3>{t('showcase.tableTitle')}</h3>
            <Table
              caption={t('showcase.tableCaption')}
              columns={[
                { key: 'component', label: t('showcase.component') },
                { key: 'purpose', label: t('showcase.role') },
                { key: 'state', label: t('showcase.state') },
              ]}
              rows={[1, 2, 3].map((row) => ({
                component: t(`showcase.tableRow${row}`),
                purpose: t(`showcase.tableRole${row}`),
                state: <Badge tone="success">{t('showcase.ready')}</Badge>,
              }))}
            />
            <div className="spec-chip-row">
              {chip ? (
                <FilterChip removeLabel={t('showcase.close')} onRemove={() => setChip(false)}>
                  {t('showcase.exampleChip')}
                </FilterChip>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setChip(true)}>
                  {t('showcase.restoreChip')}
                </Button>
              )}
            </div>
            <Divider />
            <ComparisonIndicator count={0} label={t('showcase.comparison')} />
            <p className="spec-small-note">{t('showcase.comparisonDescription')}</p>
          </Panel>
        </div>
        <div className="spec-motion-grid">
          <Panel className="spec-motion-panel">
            <div>
              <div className="spec-panel-overline">
                <WandSparkles size={16} />
                <span>{t('showcase.motionTitle')}</span>
              </div>
              <h3>{t('showcase.motionTitle')}</h3>
              <p>{t('showcase.motionDescription')}</p>
              <Button variant="secondary" size="sm" onClick={() => setMotionKey((key) => key + 1)}>
                {t('showcase.motionReplay')}
              </Button>
            </div>
            <div className="spec-motion-stage">
              <div key={motionKey} className="spec-motion-sample">
                <span className="spec-motion-icon">
                  <Layers3 size={19} />
                </span>
                <span>{t('showcase.motionSample')}</span>
              </div>
              <small>{t('showcase.motionReduced')}</small>
            </div>
          </Panel>
          <Card className="spec-card-pad spec-loading-panel">
            <h3>{t('showcase.skeleton')}</h3>
            <Skeleton className="spec-skeleton-title" />
            <Skeleton />
            <Skeleton />
            <div className="spec-motion-timing">
              <span>
                {t('showcase.motionFast')}
                <code>{motionTokens.feedback} ms</code>
              </span>
              <span>
                {t('showcase.motionPanel')}
                <code>{motionTokens.panel} ms</code>
              </span>
              <span>
                {t('showcase.motionChart')}
                <code>{motionTokens.chart} ms</code>
              </span>
            </div>
          </Card>
        </div>
      </section>
      <footer className="spec-footer">
        <SquareDashed size={17} />
        <p>{t('showcase.footer')}</p>
      </footer>
    </div>
  );
}
