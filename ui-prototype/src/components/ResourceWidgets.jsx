import { AlertTriangle, BarChart3, CheckCircle2, Circle, Clock3, FileText, Gauge } from 'lucide-react';

const defaultTimeline = [
  { label: 'Reserved', hours: 54, tone: '#64748b' },
  { label: 'Project', hours: 128, tone: '#2563eb' },
  { label: 'Ad-hoc', hours: 38, tone: '#0891b2' },
  { label: 'Explore', hours: 22, tone: '#7c3aed' },
  { label: 'Buffer', hours: 34, tone: '#16a34a' }
];

const defaultRisks = [
  'Ad-hoc が 40h を超える場合は Project 側の再見積もりが必要',
  'Explore は不確実性が高いため、完了条件を短く切る',
  'Reserved 増加時は Buffer を先に消費しない'
];

const defaultLegend = [
  { label: 'Project', description: '成果物と期限を持つ計画対象', tone: '#2563eb' },
  { label: 'Ad-hoc', description: '単発依頼、問い合わせ、障害対応', tone: '#0891b2' },
  { label: 'Explore', description: '検証、学習、将来投資', tone: '#7c3aed' },
  { label: 'Reserved', description: '会議、休暇、移動、固定予定', tone: '#64748b' }
];

const defaultSummary = [
  { label: 'Team capacity', value: '248h' },
  { label: 'Committed', value: '214h' },
  { label: 'Buffer', value: '34h' }
];

export function CapacityTimeline({ items = defaultTimeline, totalHours = 276 }) {
  return (
    <section className="brw-widget brw-capacity-timeline" aria-label="Capacity timeline">
      <div className="brw-widget__header">
        <div>
          <p className="brw-widget__eyebrow">Capacity timeline</p>
          <h3>配分の全体像</h3>
        </div>
        <Gauge size={20} aria-hidden="true" />
      </div>
      <div className="brw-timeline-bar">
        {items.map((item) => (
          <span
            aria-label={`${item.label} ${item.hours} hours`}
            className="brw-timeline-bar__segment"
            key={item.label}
            style={{ backgroundColor: item.tone, width: `${Math.max((item.hours / totalHours) * 100, 4)}%` }}
          />
        ))}
      </div>
      <div className="brw-timeline-list">
        {items.map((item) => (
          <div className="brw-timeline-item" key={item.label}>
            <span className="brw-color-dot" style={{ backgroundColor: item.tone }} />
            <span>{item.label}</span>
            <strong>{item.hours}h</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RiskCallout({ title = '判断前に見るリスク', items = defaultRisks, level = 'warning' }) {
  const Icon = level === 'clear' ? CheckCircle2 : AlertTriangle;

  return (
    <aside className={`brw-widget brw-risk-callout brw-risk-callout--${level}`}>
      <div className="brw-widget__header">
        <div>
          <p className="brw-widget__eyebrow">Risk callout</p>
          <h3>{title}</h3>
        </div>
        <Icon size={20} aria-hidden="true" />
      </div>
      <ul className="brw-risk-list">
        {items.map((item) => (
          <li key={item}>
            <Circle size={8} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function AllocationLegend({ items = defaultLegend }) {
  return (
    <section className="brw-widget brw-allocation-legend" aria-label="Allocation legend">
      <div className="brw-widget__header">
        <div>
          <p className="brw-widget__eyebrow">Allocation legend</p>
          <h3>管理区分</h3>
        </div>
        <BarChart3 size={20} aria-hidden="true" />
      </div>
      <div className="brw-legend-grid">
        {items.map((item) => (
          <div className="brw-legend-item" key={item.label}>
            <span className="brw-color-dot" style={{ backgroundColor: item.tone }} />
            <div>
              <strong>{item.label}</strong>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReportSummary({ title = 'Sprint report', summary = defaultSummary, note = '現在の配分はレビュー可能な範囲です。' }) {
  return (
    <section className="brw-widget brw-report-summary" aria-label={title}>
      <div className="brw-widget__header">
        <div>
          <p className="brw-widget__eyebrow">Report summary</p>
          <h3>{title}</h3>
        </div>
        <FileText size={20} aria-hidden="true" />
      </div>
      <dl className="brw-summary-grid">
        {summary.map((item) => (
          <div className="brw-summary-item" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
      <p className="brw-summary-note">
        <Clock3 size={16} aria-hidden="true" />
        <span>{note}</span>
      </p>
    </section>
  );
}
