import {
  ArrowRight,
  BookOpenCheck,
  Boxes,
  CheckCircle2,
  Compass,
  Gauge,
  Layers3,
  Lightbulb,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const categoryNotes = [
  {
    label: 'Project',
    description: '期限、成果物、マイルストーンを持つ計画対象。',
    cue: '約束した価値を届ける時間',
    tone: '#2563eb'
  },
  {
    label: 'Ad-hoc',
    description: '問い合わせ、障害対応、単発依頼などの突発対応。',
    cue: '予定外に吸い込まれる時間',
    tone: '#0891b2'
  },
  {
    label: 'Explore',
    description: '調査、検証、学習、将来の選択肢を増やす活動。',
    cue: '不確実性を減らす時間',
    tone: '#7c3aed'
  },
  {
    label: 'Reserved',
    description: '会議、休暇、移動、固定予定など、先に差し引く時間。',
    cue: '最初から使えない時間',
    tone: '#64748b'
  }
];

const checklistItems = [
  '営業日から休暇、会議、固定予定を差し引く',
  '残った総量を Project / Ad-hoc / Explore に配分する',
  'Buffer が薄い場合は、タスク追加ではなく配分を見直す',
  '実戦闘力が予想を下回る理由を人ではなく条件から探す'
];

const glossaryItems = [
  { term: 'リソース総量', meaning: 'チームが対象期間に実際に使える時間の合計。' },
  { term: '予想戦闘力', meaning: '計画時点で見込んだ遂行能力。見積もり、稼働率、集中度を含む。' },
  { term: '実戦闘力', meaning: '進行中に観測された実際の遂行能力。割り込みや詰まりを反映する。' },
  { term: 'Buffer', meaning: '変動、手戻り、突発対応を吸収するために残す余白。' }
];

const powerRows = [
  { label: '予想戦闘力', value: 182, description: '計画時点の見込み。受ける仕事量の上限を決める基準。' },
  { label: '実戦闘力', value: 168, description: '現在の実績。計画との差分から調整判断を始める。' }
];

export function FirstRunBanner({
  title = 'タスク一覧を見る前に、使えるリソース総量を見る',
  body = 'Beyond R の判断起点は、積まれたタスクの数ではありません。期間内に使える総量を先に決め、Project / Ad-hoc / Explore / Reserved の配分で現実性を確認します。'
}) {
  return (
    <section className="brt-first-run-banner" aria-label="Tutorial introduction">
      <div className="brt-first-run-banner__icon">
        <BookOpenCheck size={24} aria-hidden="true" />
      </div>
      <div className="brt-first-run-banner__copy">
        <p className="brt-eyebrow">First run</p>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <div className="brt-first-run-banner__signal" aria-hidden="true">
        <Boxes size={18} />
        <ArrowRight size={18} />
        <Gauge size={18} />
      </div>
    </section>
  );
}

export function ConceptBridge({
  from = 'タスク一覧',
  to = 'リソース総量',
  caption = '細かいタスクから始めると、受けられる範囲を見誤ります。先に総量を固定し、その中で何を入れるかを決めます。'
}) {
  return (
    <section className="brt-concept-bridge" aria-label="Concept bridge">
      <div className="brt-concept-bridge__node brt-concept-bridge__node--muted">
        <Layers3 size={20} aria-hidden="true" />
        <span>{from}</span>
      </div>
      <ArrowRight className="brt-concept-bridge__arrow" size={22} aria-hidden="true" />
      <div className="brt-concept-bridge__node brt-concept-bridge__node--primary">
        <Gauge size={20} aria-hidden="true" />
        <span>{to}</span>
      </div>
      <p>{caption}</p>
    </section>
  );
}

export function AllocationPrimer({ items = categoryNotes }) {
  return (
    <section className="brt-allocation-primer" aria-label="Allocation categories">
      <div className="brt-widget-heading">
        <div>
          <p className="brt-eyebrow">Allocation primer</p>
          <h3>4つの管理区分</h3>
        </div>
        <Compass size={20} aria-hidden="true" />
      </div>
      <div className="brt-allocation-primer__grid">
        {items.map((item) => (
          <article className="brt-allocation-primer__item" key={item.label}>
            <span className="brt-color-mark" style={{ backgroundColor: item.tone }} />
            <div>
              <h4>{item.label}</h4>
              <p>{item.description}</p>
              <strong>{item.cue}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function GuidedChecklist({ items = checklistItems }) {
  return (
    <section className="brt-guided-checklist" aria-label="Guided checklist">
      <div className="brt-widget-heading">
        <div>
          <p className="brt-eyebrow">Guided checklist</p>
          <h3>初回レビューの順番</h3>
        </div>
        <CheckCircle2 size={20} aria-hidden="true" />
      </div>
      <ol className="brt-guided-checklist__list">
        {items.map((item, index) => (
          <li key={item}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{item}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PowerDeltaExplainer({ rows = powerRows }) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <section className="brt-power-delta" aria-label="Forecast and actual power">
      <div className="brt-widget-heading">
        <div>
          <p className="brt-eyebrow">Power delta</p>
          <h3>予想戦闘力と実戦闘力</h3>
        </div>
        <Sparkles size={20} aria-hidden="true" />
      </div>
      <div className="brt-power-delta__rows">
        {rows.map((row) => (
          <article className="brt-power-delta__row" key={row.label}>
            <div className="brt-power-delta__label">
              <strong>{row.label}</strong>
              <span>{row.value}h</span>
            </div>
            <div className="brt-power-delta__meter" aria-label={`${row.label} ${row.value} hours`}>
              <span style={{ width: `${(row.value / max) * 100}%` }} />
            </div>
            <p>{row.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function GlossaryStrip({ items = glossaryItems }) {
  return (
    <section className="brt-glossary-strip" aria-label="Tutorial glossary">
      <div className="brt-widget-heading">
        <div>
          <p className="brt-eyebrow">Glossary</p>
          <h3>用語の見方</h3>
        </div>
        <Lightbulb size={20} aria-hidden="true" />
      </div>
      <dl className="brt-glossary-strip__list">
        {items.map((item) => (
          <div className="brt-glossary-strip__item" key={item.term}>
            <dt>{item.term}</dt>
            <dd>{item.meaning}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function TutorialDecisionNote({
  title = '判断は個人評価ではなく、配分条件の調整に使う',
  body = '予想戦闘力と実戦闘力の差分は、誰かを責めるためではなく、Reserved の増加、Ad-hoc の割り込み、Explore の不確実性を見直すための材料です。'
}) {
  return (
    <aside className="brt-decision-note">
      <ShieldCheck size={22} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </aside>
  );
}
