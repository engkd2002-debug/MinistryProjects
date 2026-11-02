import { Link, useLocation } from 'react-router-dom';
import {
  Map,
  Layers2,
  Focus,
  ArrowRight,
  Search,
  BookOpen,
  GitCompareArrows,
  ChartNoAxesCombined,
  Table2,
  Info,
  ShieldCheck,
  ClipboardList,
  Library,
  ScanLine,
  Compass,
} from 'lucide-react';
import { useI18n } from '../../shared/i18n';
import { Badge, Button } from '../../shared/ui';
import { MotionRegion } from '../../shared/motion';
import { QueryContext, useScope } from '../../shared/query';

import './workspace.css';
const configs = {
  explorer: {
    kicker: 'explorerKicker',
    title: 'explorerTitle',
    desc: 'explorerDesc',
    canvasTitle: 'canvasTitle',
    canvasDesc: 'canvasDesc',
    placeholder: 'canvasPlaceholder',
    disclaimer: 'canvasDisclaimer',
    phase: 3,
    icon: Map,
    items: [
      ['geoItem1', 'geoText1', Focus],
      ['geoItem2', 'geoText2', BookOpen],
      ['geoItem3', 'geoText3', Layers2],
    ],
    link: '/research',
    linkLabel: 'viewResearch',
  },
  research: {
    kicker: 'researchKicker',
    title: 'researchTitle',
    desc: 'researchDesc',
    canvasTitle: 'researchCanvasTitle',
    canvasDesc: 'researchCanvasDesc',
    placeholder: 'researchPlaceholder',
    disclaimer: 'researchDisclaimer',
    phase: 4,
    icon: BookOpen,
    items: [
      ['researchItem1', 'researchText1', Search],
      ['researchItem2', 'researchText2', GitCompareArrows],
      ['researchItem3', 'researchText3', ClipboardList],
    ],
    link: '/explorer',
    linkLabel: 'viewExplorer',
  },
  insights: {
    kicker: 'insightsKicker',
    title: 'insightsTitle',
    desc: 'insightsDesc',
    canvasTitle: 'insightsCanvasTitle',
    canvasDesc: 'insightsCanvasDesc',
    placeholder: 'insightsPlaceholder',
    disclaimer: 'insightsDisclaimer',
    phase: 5,
    icon: ChartNoAxesCombined,
    items: [
      ['insightsItem1', 'insightsText1', ChartNoAxesCombined],
      ['insightsItem2', 'insightsText2', Table2],
      ['insightsItem3', 'insightsText3', Info],
    ],
    link: '/research',
    linkLabel: 'viewResearch',
  },
  support: {
    kicker: 'supportKicker',
    title: 'supportTitle',
    desc: 'supportDesc',
    canvasTitle: 'supportCanvasTitle',
    canvasDesc: 'supportCanvasDesc',
    placeholder: 'supportPlaceholder',
    disclaimer: 'supportDisclaimer',
    phase: 6,
    icon: ShieldCheck,
    items: [
      ['supportItem1', 'supportText1', ShieldCheck],
      ['supportItem2', 'supportText2', ClipboardList],
      ['supportItem3', 'supportText3', Library],
    ],
    link: '/explorer',
    linkLabel: 'viewExplorer',
  },
} as const;
export function WorkspacePage({
  kind,
  supportLabel,
}: {
  kind: keyof typeof configs;
  supportLabel?: string;
}) {
  const { t, formatNumber } = useI18n();
  const { openScope } = useScope();
  const location = useLocation();
  const c = configs[kind];
  const Icon = c.icon;
  return (
    <MotionRegion className="workspace-page" key={location.pathname}>
      <div className="workspace-page-heading">
        <div className="page-eyebrow">
          <span className="eyebrow-line" />
          {t(c.kicker)}
        </div>
        <div className="workspace-title-row">
          <div>
            <h1 id="workspace-heading" tabIndex={-1}>
              {kind === 'support' && supportLabel
                ? t(supportLabel)
                : t(
                    kind === 'explorer'
                      ? 'explorer'
                      : kind === 'research'
                        ? 'research'
                        : 'insights',
                  )}
            </h1>
            <p>{t(c.desc)}</p>
          </div>
          <Badge tone="neutral">
            {t('phaseLabel')}
            <bdi>{formatNumber(c.phase)}</bdi>
          </Badge>
        </div>
      </div>
      <QueryContext />
      <div className="workspace-grid">
        <section className="workspace-canvas" aria-labelledby="canvas-heading">
          <header className="canvas-header">
            <span className="canvas-symbol">
              <Icon size={19} />
            </span>
            <div>
              <h2 id="canvas-heading">{t(c.canvasTitle)}</h2>
              <p>{t(c.canvasDesc)}</p>
            </div>
            <span className="canvas-index" dir="ltr">
              {kind === 'support' ? '—' : `0${c.phase - 2} / 03`}
            </span>
          </header>
          <div className="canvas-interior">
            <div className="canvas-coordinate coordinate-a" aria-hidden="true">
              +
            </div>
            <div className="canvas-coordinate coordinate-b" aria-hidden="true">
              +
            </div>
            <div className="canvas-coordinate coordinate-c" aria-hidden="true">
              +
            </div>
            <div className="canvas-coordinate coordinate-d" aria-hidden="true">
              +
            </div>
            <div className="spatial-motif" aria-hidden="true">
              <svg width="240" height="180" viewBox="0 0 240 180" fill="none">
                <path d="M20 114 120 58l100 56-100 56-100-56Z" />
                <path d="m20 88 100-56 100 56-100 56L20 88Z" />
                <path d="m20 62 100-56 100 56-100 56L20 62Z" />
                <path d="M120 6v52M20 62v52m200-52v52" strokeDasharray="3 5" />
                <circle cx="120" cy="62" r="16" />
                <path d="M114 62h12m-6-6v12" />
              </svg>
            </div>
            <span className="canvas-stage">
              <i />
              {t(c.placeholder)}
            </span>
            <h3>{t(c.title)}</h3>
            <p className="canvas-disclaimer">{t(c.disclaimer)}</p>
            <Button variant="secondary" onClick={openScope}>
              <ScanLine size={16} />
              {t('editScope')}
            </Button>
          </div>
          <div className="canvas-bottom">
            <Compass size={15} />
            <span>{t('notImplemented')}</span>
          </div>
        </section>
        <aside className="workspace-guide">
          <div className="guide-heading">
            <span className="small-kicker">{t('capabilities')}</span>
            <Badge>{t('planned')}</Badge>
          </div>
          <div className="capability-list">
            {c.items.map(([title, desc, ItemIcon], index) => (
              <div className="capability" key={title}>
                <span className="capability-index" dir="ltr">
                  0{index + 1}
                </span>
                <div>
                  <ItemIcon size={18} />
                  <h3>{t(title)}</h3>
                  <p>{t(desc)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="continuity-note">
            <span className="continuity-icon">
              <Layers2 size={20} />
            </span>
            <h3>{t('contextTitle')}</h3>
            <p>{t('contextDesc')}</p>
            <Link to={{ pathname: c.link, search: location.search }}>
              {t(c.linkLabel)}
              <ArrowRight size={16} className="directional-icon" />
            </Link>
          </div>
        </aside>
      </div>
    </MotionRegion>
  );
}
