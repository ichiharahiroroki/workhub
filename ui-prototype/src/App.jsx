import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Filter,
  Flag,
  FolderKanban,
  GitPullRequest,
  LayoutDashboard,
  Layers3,
  ListChecks,
  MessageSquareMore,
  Milestone,
  PackageCheck,
  Plus,
  Search,
  Send,
  Trash2,
  Users
} from 'lucide-react';
import { FieldHint, HelpButton } from './components/HelpSystem.jsx';
import { mockApi } from './mock-server/mockApi.js';

const menu = [
  { id: 'mytasks', label: 'マイタスク', icon: ClipboardCheck },
  { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { id: 'resources', label: 'リソース管理', icon: CalendarDays },
  { id: 'tasks', label: 'タスク管理', icon: ListChecks }
];

const helpText = {
  mytasks: '目的: 自分が担当者、または現在アサインされているチケットだけを確認します。\n概要: 初期表示では未完了のタスクと成果物だけを表示します。必要に応じて過去も含む表示に切り替え、doneになった作業も確認できます。',
  dashboard: '目的: 対象者と期間を指定し、見積総量に対してどこまで完了しているかを時間(h)で確認します。\n概要: バーンアップグラフで、見積総量、予定通り進む場合の予測線、実績線を比較します。Project / Ad-hoc / Explore ごとの絞り込みもできます。',
  resources: '目的: 誰がいつどれだけ余力を持っているかを確認し、タスクを受けられる状態か判断します。\n概要: 未固定タスクは成果物単位のタブで束ね、完了日が近く優先度が高い順に表示します。成果物タブやタスクをカレンダーへドラッグして仮配置でき、8hを超える場合は警告を出しながら配置できます。',
  tasks: '目的: Project / Ad-hoc / Explore の成果物とタスクを階層で管理し、進捗と作業単位を追えるようにします。\n概要: Projects、Project名、マイルストーン、成果物、タスクへ掘り下げます。Ad-hocやExploreもカテゴリ、成果物、タスクの順で管理します。',
  ticket: '成果物チケットは作成物単位、タスクチケットは作業単位です。Ad-hocもカテゴリの下に成果物、その下にタスクを置きます。Issue、PR、Slack作業スレ、Driveなどを紐づけます。'
};

const kindThemes = {
  Projects: {
    key: 'projects',
    label: 'Projects',
    description: 'Projects',
    icon: Layers3,
    color: '#1d4ed8',
    bg: '#dbeafe'
  },
  '管理区分': {
    key: 'type',
    label: '管理区分',
    description: 'Project / Ad-hoc / Explore の最上位分類',
    icon: Layers3,
    color: '#475569',
    bg: '#f1f5f9'
  },
  Project: {
    key: 'project',
    label: 'Project',
    description: '複数のマイルストーンを持つ管理単位',
    icon: FolderKanban,
    color: '#2563eb',
    bg: '#dbeafe'
  },
  マイルストーン: {
    key: 'milestone',
    label: 'マイルストーン',
    description: '期限と達成判断を持つ中間ゴール',
    icon: Milestone,
    color: '#7c3aed',
    bg: '#ede9fe'
  },
  成果物チケット: {
    key: 'deliverable',
    label: '成果物',
    description: '作成物・納品物・リポジトリ単位',
    icon: PackageCheck,
    color: '#0891b2',
    bg: '#cffafe'
  },
  タスクチケット: {
    key: 'task',
    label: 'タスク',
    description: 'Issue / PR / Slack作業スレに紐づく作業単位',
    icon: ClipboardCheck,
    color: '#f97316',
    bg: '#ffedd5'
  },
  カテゴリ: {
    key: 'category',
    label: 'カテゴリ',
    description: 'Ad-hoc / Explore の分類単位',
    icon: Flag,
    color: '#0f766e',
    bg: '#ccfbf1'
  },
  default: {
    key: 'default',
    label: '項目',
    description: 'WBS項目',
    icon: ListChecks,
    color: '#64748b',
    bg: '#f8fafc'
  }
};

const statusOptions = [
  { value: 'todo', label: 'ToDo' },
  { value: 'doing', label: 'doing' },
  { value: 'review', label: 'review' },
  { value: 'done', label: 'done' },
  { value: 'discard', label: 'discard' }
];

const priorityOptions = [
  { value: 'critical', label: 'クリティカル', rank: 0 },
  { value: 'high', label: '高', rank: 1 },
  { value: 'medium', label: '中', rank: 2 },
  { value: 'low', label: '低', rank: 3 }
];

const aiMenus = {
  mytasks: [
    { id: 'today', label: '今日やるべきタスク', description: '期限・優先度・ボールの所在から着手順を整理', preview: '今日の着手候補を、期限が近いものとレビュー待ちの戻しから並べます。' },
    { id: 'cleanup', label: 'チケット整理', description: '抜けている担当者・期限・説明を洗い出す', preview: '担当者、アサイン、完了条件、リンクが不足しているチケットを確認します。' },
    { id: 'workstyle', label: '働き方を評価', description: '投下工数と完了状況から偏りを確認', preview: 'レビュー待ちの滞留、見積との差分、割り込み作業の比率を振り返ります。' }
  ],
  dashboard: [
    { id: 'progress', label: '進捗評価', description: '遅延・予定通り・巻き取りを原因つきで確認', preview: 'バーンアップの実績線と予測線を比較し、遅延要因や巻き取り要因を説明します。' },
    { id: 'swap', label: 'タスクの差し替え提案', description: '期限・優先度・空きリソースから入れ替え候補を提示', preview: '期間内に終えるべきタスクと後ろ倒しできるタスクを比較して提案します。' }
  ],
  resources: [
    { id: 'assign', label: '未固定タスクの割り当て', description: '成果物別の未固定タスクを空き枠へ配置', preview: '空きリソース、期限、優先度を見て、どの日にどのタスクを置くか提案します。' },
    { id: 'change', label: '予定の変更依頼', description: 'Reservedや過負荷日の調整依頼文を作る', preview: '8h超過日や会議が多い日を見つけ、関係者へ送る調整依頼を下書きします。' }
  ],
  ticket: [
    { id: 'delegate', label: 'delegate to AI', description: 'AIに作業を委任する前提で依頼内容を整理', preview: '完了条件、入力情報、期待成果物を確認し、AIへ渡す作業指示を作ります。' },
    { id: 'with', label: 'work with AI', description: 'AIと会話しながら作業を進める', preview: '論点整理、実装方針、レビュー観点などをチケット文脈に沿って相談できます。' },
    { id: 'autofill', label: '自動で記入', description: '説明・完了条件・関連リンクの不足を補う', preview: '既存のチケット名や関連情報から、説明欄やチェック項目の下書きを作ります。' }
  ]
};

const markdownTemplates = [
  {
    value: 'standard',
    label: '標準テンプレート',
    build: (node) => `## 概要
${getDetailNarrative(node)}

## 完了条件
- 

## 確認事項
- `
  },
  {
    value: 'deliverable',
    label: '成果物テンプレート',
    build: (node) => `## 成果物の目的
${node?.name || 'この成果物'}で達成したい状態を記載します。

## 完了条件
- 成果物として確認できる状態になっている
- 配下タスクが完了している

## 受け入れ観点
- `
  },
  {
    value: 'task',
    label: 'タスクテンプレート',
    build: (node) => `## 作業内容
${node?.name || 'このタスク'}で実施する作業を記載します。

## 完了条件
- レビューに必要な情報が揃っている

## 確認事項
- `
  },
  {
    value: 'review',
    label: 'レビュー依頼テンプレート',
    build: () => `## レビューしてほしいこと
- 

## 変更内容
- 

## 判断してほしいこと
- `
  }
];

const PROTOTYPE_BASE_DATE = '2026-06-01';
const PROTOTYPE_MONTH_START = '2026-06-01';
const PROTOTYPE_MONTH_END = '2026-06-30';
const PROTOTYPE_CURRENT_USER_ID = 'suzuki';

export function App() {
  const [active, setActive] = useState(() => getActiveScreenFromHash(window.location.hash));
  const [help, setHelp] = useState(null);

  useEffect(() => {
    function syncActiveFromHash() {
      setActive(getActiveScreenFromHash(window.location.hash));
    }

    if (!window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/dashboard`);
    }
    syncActiveFromHash();
    window.addEventListener('hashchange', syncActiveFromHash);
    return () => window.removeEventListener('hashchange', syncActiveFromHash);
  }, []);

  function moveMenu(nextActive) {
    const nextHash = `#/${nextActive}`;
    setActive(nextActive);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">BR</div>
          <div>
            <p>Beyond R</p>
            <span>Resource management</span>
          </div>
        </div>
        <nav className="nav-list">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <button className={active === item.id ? 'nav-item active' : 'nav-item'} key={item.id} onClick={() => moveMenu(item.id)} type="button">
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Beyond R prototype</p>
            <h1>{menu.find((item) => item.id === active)?.label}</h1>
          </div>
          <div className="topbar-help">
            <HelpTrigger label="画面の説明" onClick={() => setHelp(active)} />
          </div>
        </header>

        {help && <HelpDrawer title="画面の説明" body={helpText[help]} onClose={() => setHelp(null)} />}
        {active === 'mytasks' && <MyTasks />}
        {active === 'dashboard' && <Dashboard onHelp={setHelp} />}
        {active === 'resources' && <Resources onHelp={setHelp} />}
        {active === 'tasks' && <Tasks onHelp={setHelp} />}
      </main>
    </div>
  );
}

function HelpTrigger({ label, onClick }) {
  return (
    <button className="help-trigger" onClick={onClick} type="button">
      <CircleHelp size={18} />
      <span>{label}</span>
    </button>
  );
}

function HelpDrawer({ title, body, onClose }) {
  return (
    <aside className="help-drawer">
      <div>
        <strong>{title}</strong>
        <button onClick={onClose} type="button">閉じる</button>
      </div>
      <p>{body}</p>
    </aside>
  );
}

function AiActionMenu({ items, helpTitle, helpBody }) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(items[0]?.id || null);
  const menuRef = useRef(null);
  const selectedItem = items.find((item) => item.id === selectedId) || items[0];

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  return (
    <div className="ai-action-menu" ref={menuRef}>
      <button aria-label="AIメニューを開く" className={open ? 'ai-logo-button active' : 'ai-logo-button'} onClick={() => setOpen((current) => !current)} type="button">
        <Bot size={15} aria-hidden="true" />
        <span>AI</span>
      </button>
      {open ? (
        <div className="ai-menu-popover">
          <div className="ai-menu-head">
            <strong>AIメニュー</strong>
            <HelpButton title={helpTitle} body={helpBody} />
          </div>
          <div className="ai-menu-list">
            {items.map((item) => (
              <button
                className={selectedItem?.id === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                type="button"
              >
                <span>{item.label}</span>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
          {selectedItem ? (
            <div className="ai-menu-preview">
              <strong>{selectedItem.label}</strong>
              <p>{selectedItem.preview}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function getActiveScreenFromHash(hash) {
  if (hash?.startsWith('#/mytasks')) return 'mytasks';
  if (hash?.startsWith('#/resources')) return 'resources';
  if (hash?.startsWith('#/tasks')) return 'tasks';
  return 'dashboard';
}

function MyTasks() {
  const tree = useMemo(() => mockApi.tasks.getWorkTree(), []);
  const members = useMemo(() => mockApi.master.getMembers(), []);
  const currentUser = members.find((member) => member.id === PROTOTYPE_CURRENT_USER_ID) || members[0];
  const currentUserId = currentUser?.id || PROTOTYPE_CURRENT_USER_ID;
  const [activeTab, setActiveTab] = useState('tasks');
  const [historyMode, setHistoryMode] = useState('open');
  const [expandedDeliverableIds, setExpandedDeliverableIds] = useState(() => new Set());
  const allTaskItems = useMemo(() => collectPersonalTickets(tree, currentUserId, 'タスクチケット'), [tree, currentUserId]);
  const allDeliverableItems = useMemo(() => collectPersonalTickets(tree, currentUserId, '成果物チケット'), [tree, currentUserId]);
  const taskItems = useMemo(() => filterMyTaskHistory(allTaskItems, historyMode), [allTaskItems, historyMode]);
  const deliverableItems = useMemo(() => filterMyTaskHistory(allDeliverableItems, historyMode), [allDeliverableItems, historyMode]);
  const taskHours = taskItems.reduce((sum, item) => sum + Number(item.node.estimate ?? item.node.plannedHours ?? 0), 0);
  const deliverableHours = deliverableItems.reduce((sum, item) => sum + getNodeHours(item.node).planned, 0);

  function toggleDeliverable(nodeId) {
    setExpandedDeliverableIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  return (
    <section className="mytasks-layout">
      <section className="panel mytasks-panel">
        <div className="mytasks-summary">
          <div>
            <p className="eyebrow">My work</p>
            <h2>{currentUser?.name || '自分'} の担当・アサインチケット</h2>
          </div>
          <div className="mytasks-summary-side">
            <AiActionMenu
              items={aiMenus.mytasks}
              helpTitle="マイタスクのAI"
              helpBody="実際のサービスでは、ここでAIと自分のタスクについて会話できます。今日やるべき作業、チケット整理、働き方の振り返りを相談する入口です。"
            />
            <div className="mytasks-metrics" aria-label="マイタスク指標">
              <Metric label="タスク" value={`${taskItems.length}件 / ${taskHours}h`} color="#f97316" />
              <Metric label="成果物" value={`${deliverableItems.length}件 / ${deliverableHours}h`} color="#0891b2" />
            </div>
          </div>
        </div>

        <div className="mytasks-controls">
          <div className="mytasks-tabs" role="tablist" aria-label="マイタスク表示切替">
            <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')} type="button">
              タスク
            </button>
            <button className={activeTab === 'deliverables' ? 'active' : ''} onClick={() => setActiveTab('deliverables')} type="button">
              成果物
            </button>
          </div>
          <div className="mytasks-history-switch" aria-label="表示範囲">
            <button className={historyMode === 'open' ? 'active' : ''} onClick={() => setHistoryMode('open')} type="button">
              未完了のみ
            </button>
            <button className={historyMode === 'all' ? 'active' : ''} onClick={() => setHistoryMode('all')} type="button">
              過去も含む
            </button>
          </div>
        </div>

        {activeTab === 'tasks' ? (
          <div className="mytask-table" role="table" aria-label="自分のタスク">
            <div className="mytask-head" role="row">
              <span>#</span>
              <span>チケット</span>
              <span>タイプ</span>
              <span>ステータス</span>
              <span>担当者</span>
              <span>アサイン</span>
              <span>開始日</span>
              <span>完了日</span>
              <span>見積/実績</span>
            </div>
            {taskItems.map(({ node }) => {
              const hours = getNodeHours(node);
              return (
                <div className="mytask-row" key={node.id} role="row">
                  <div>{node.displayNo ? <a className="wbs-number" href={getTaskDetailHash(node.displayNo)}>#{node.displayNo}</a> : '-'}</div>
                  <div className="mytask-title-cell">
                    <KindBadge node={node} />
                    <strong>{node.name}</strong>
                  </div>
                  <div><span className="mytask-type">{node.type}</span></div>
                  <div><StatusProgressCell node={node} progress={null} /></div>
                  <div className="mytask-empty-cell">-</div>
                  <div className="mytask-empty-cell">-</div>
                  <div className="date-cell">{formatDateLabel(node.startDate)}</div>
                  <div className="date-cell">{formatDateLabel(node.completedDate)}</div>
                  <div className="hours-cell">{hours.planned || '-'}h / {hours.actual}h</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mytask-table mytask-table--deliverables" role="table" aria-label="自分の成果物">
            <div className="mytask-head" role="row">
              <span>#</span>
              <span>成果物</span>
              <span>タイプ</span>
              <span>ステータス/進捗</span>
              <span>担当者</span>
              <span>アサイン</span>
              <span>開始日</span>
              <span>完了日</span>
              <span>見積/実績</span>
            </div>
            {deliverableItems.map(({ node }) => {
              const hours = getNodeHours(node);
              const progress = getTaskCompletionProgress(node);
              const taskChildren = (node.children || []).filter((child) => child.kind === 'タスクチケット');
              const expanded = expandedDeliverableIds.has(node.id);
              return (
                <Fragment key={node.id}>
                  <div className="mytask-row mytask-row--deliverable" role="row">
                    <div>{node.displayNo ? <a className="wbs-number" href={getTaskDetailHash(node.displayNo)}>#{node.displayNo}</a> : '-'}</div>
                    <div className="mytask-title-cell">
                      {taskChildren.length ? (
                        <button className="tree-toggle" onClick={() => toggleDeliverable(node.id)} title="配下タスクを開閉" type="button">
                          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>
                      ) : (
                        <span className="tree-toggle-spacer" aria-hidden="true" />
                      )}
                      <KindBadge node={node} />
                      <strong>{node.name}</strong>
                    </div>
                    <div><span className="mytask-type">{node.type}</span></div>
                    <div><StatusProgressCell node={node} progress={progress} /></div>
                    <div className="mytask-empty-cell">-</div>
                    <div className="mytask-empty-cell">-</div>
                    <div className="date-cell">{formatDateLabel(node.startDate)}</div>
                    <div className="date-cell">{formatDateLabel(node.completedDate)}</div>
                    <div className="hours-cell">{hours.planned || '-'}h / {hours.actual}h</div>
                  </div>
                  {expanded ? taskChildren.map((task) => {
                    const taskHours = getNodeHours(task);
                    return (
                      <div className="mytask-row mytask-row--child" key={task.id} role="row">
                        <div>{task.displayNo ? <a className="wbs-number" href={getTaskDetailHash(task.displayNo)}>#{task.displayNo}</a> : '-'}</div>
                        <div className="mytask-title-cell">
                          <span className="tree-toggle-spacer" aria-hidden="true" />
                          <KindBadge node={task} />
                          <strong>{task.name}</strong>
                        </div>
                        <div><span className="mytask-type">{task.type}</span></div>
                        <div><StatusProgressCell node={task} progress={null} /></div>
                        <div className="mytask-empty-cell">-</div>
                        <div className="mytask-empty-cell">-</div>
                        <div className="date-cell">{formatDateLabel(task.startDate)}</div>
                        <div className="date-cell">{formatDateLabel(task.completedDate)}</div>
                        <div className="hours-cell">{taskHours.planned || '-'}h / {taskHours.actual}h</div>
                      </div>
                    );
                  }) : null}
                </Fragment>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

function Dashboard({ onHelp }) {
  const dashboardMock = useMemo(() => ({
    burnupSeries: mockApi.dashboard.getBurnupSeries(),
    estimateTargets: mockApi.dashboard.getEstimateTargets(),
    members: mockApi.master.getMembers()
  }), []);
  const [selectedMemberIds, setSelectedMemberIds] = useState(() => dashboardMock.members.map((member) => member.id));
  const [selectedTypes, setSelectedTypes] = useState(['Project', 'Ad-hoc', 'Explore']);
  const [dateRange, setDateRange] = useState({ start: '2026-06-01', end: '2026-06-10' });
  const memberRatio = selectedMemberIds.length / dashboardMock.members.length || 0;
  const selectedTypeKey = selectedTypes.length === 3 ? 'total' : null;
  const targetBase = selectedTypeKey
    ? dashboardMock.estimateTargets.total
    : selectedTypes.reduce((sum, type) => sum + dashboardMock.estimateTargets[type], 0);
  const target = Math.round(targetBase * memberRatio);
  const actualValues = dashboardMock.burnupSeries.map((point) => {
    const value = selectedTypeKey ? point.total : selectedTypes.reduce((sum, type) => sum + point[type], 0);
    return Math.round(value * memberRatio);
  });
  const current = actualValues.at(-1);
  const plannedValues = buildPlannedBurnupValues(dashboardMock.burnupSeries, target);
  const max = Math.max(target, ...actualValues, ...plannedValues, 1);
  const delay = target - current;

  return (
    <section className="screen-grid dashboard-screen">
      <div className="toolbar panel">
        <div className="field-block">
          <span className="field-label">対象者</span>
          <CheckboxDropdown
            items={dashboardMock.members.map((member) => ({ id: member.id, label: member.name }))}
            selectedIds={selectedMemberIds}
            onChange={setSelectedMemberIds}
            icon={Users}
            emptyLabel="対象者を選択"
          />
        </div>
        <div className="field-block">
          <span className="field-label">管理区分</span>
          <CheckboxDropdown
            items={[
              { id: 'Project', label: 'Project', sub: '計画対象' },
              { id: 'Ad-hoc', label: 'Ad-hoc', sub: '突発・単発' },
              { id: 'Explore', label: 'Explore', sub: '学習・検証' }
            ]}
            selectedIds={selectedTypes}
            onChange={setSelectedTypes}
            icon={ListChecks}
            emptyLabel="管理区分を選択"
          />
        </div>
        <div className="field-block">
          <span className="field-label">期間</span>
          <ResourceRangePicker value={dateRange} onApply={setDateRange} applyLabel="完了" />
        </div>
        <HelpButton
          title="バーンアップの線"
          body="縦軸は時間（h）です。横線は見積総量、灰色の点線は期間内に予定通り進む場合の予測線、オレンジの実線は実績です。"
        />
      </div>

      <section className="panel summary-panel dashboard-summary">
        <Metric label="対象人数" value={`${selectedMemberIds.length}名`} color="#2563eb" />
        <Metric label="見積総数" value={`${target}h`} color="#64748b" />
        <Metric label="完了工数" value={`${current}h`} color="#f97316" />
        <Metric label="差分" value={delay > 0 ? `遅延 ${delay}h` : `巻き取り ${Math.abs(delay)}h`} color={delay > 0 ? '#dc2626' : '#16a34a'} />
      </section>

      <section className="panel chart-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Burn-up</p>
            <h2>見積総量・予測・実績</h2>
          </div>
          <div className="section-heading-actions">
            <span className="status">{current}h / {target}h</span>
            <AiActionMenu
              items={aiMenus.dashboard}
              helpTitle="バーンアップのAI"
              helpBody="実際のサービスでは、ここでAIがバーンアップの線と指標を読み取り、進捗が遅延・予定通り・巻き取りのどれかと、その原因を説明します。必要に応じてタスクの差し替え候補も提案します。"
            />
          </div>
        </div>
        <BurnupChart
          actual={actualValues}
          planned={plannedValues}
          target={target}
          max={max}
          series={dashboardMock.burnupSeries}
        />
        <div className="chart-labels">
          {dashboardMock.burnupSeries.map((point) => <span className={point.workingDay ? '' : 'nonworking'} key={point.date}>{point.date}<small>{point.weekday}</small></span>)}
        </div>
        <div className="chart-legend">
          <span><i className="legend-target" />見積総量</span>
          <span><i className="legend-plan" />予測線</span>
          <span><i className="legend-actual" />実績線</span>
        </div>
      </section>
    </section>
  );
}

function CheckboxDropdown({ items, selectedIds, onChange, icon: Icon, emptyLabel }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedNames = items.filter((item) => selectedIds.includes(item.id)).map((item) => item.label);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('click', closeOnOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('click', closeOnOutsideClick);
    };
  }, []);

  function toggle(id) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="multi-select" ref={dropdownRef}>
      <button className="multi-select-button" type="button" onClick={() => setOpen((value) => !value)}>
        <Icon size={16} />
        <span>{selectedNames.length ? selectedNames.join('、') : emptyLabel}</span>
        <ChevronRight size={14} />
      </button>
      {open && (
        <div className="multi-select-menu">
          {items.map((item) => (
            <label className="multi-option" key={item.id}>
              <input checked={selectedIds.includes(item.id)} onChange={() => toggle(item.id)} type="checkbox" />
              <span>{item.label}</span>
              {item.sub ? <small>{item.sub}</small> : null}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function buildPlannedBurnupValues(series, target) {
  const workingSteps = Math.max(series.filter((point) => point.workingDay).length - 1, 1);
  const step = target / workingSteps;
  let current = 0;

  return series.map((point, index) => {
    if (index === 0) return 0;
    if (point.workingDay) current += step;
    return Math.round(Math.min(current, target));
  });
}

function BurnupChart({ actual, planned, target, max, series }) {
  const points = (values) => values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = chartY(value, max);
    return `${x},${y}`;
  }).join(' ');
  const targetY = chartY(target, max);
  const yTicks = Array.from({ length: 5 }, (_, index) => Math.round((max / 4) * (4 - index)));

  return (
    <div className="burn-chart-frame">
      <div className="y-axis" aria-hidden="true">
        <span className="y-axis-title">時間（h）</span>
        {yTicks.map((tick) => (
          <span className="y-axis-label" key={tick} style={{ top: `${chartY(tick, max)}%` }}>{tick}h</span>
        ))}
      </div>
      <svg className="burn-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
        {series.map((point, index) => {
          if (point.workingDay) return null;
          const bandWidth = 100 / (series.length - 1);
          const x = Math.max(0, (index / (series.length - 1)) * 100 - bandWidth / 2);
          return <rect className="nonworking-band" key={point.date} x={x} y="10" width={bandWidth} height="82" />;
        })}
        {yTicks.map((tick) => {
          const y = chartY(tick, max);
          return <line className="grid-line" key={tick} x1="0" x2="100" y1={y} y2={y} />;
        })}
        <line className="axis" x1="0" x2="100" y1="92" y2="92" />
        <line className="axis" x1="0" x2="0" y1="10" y2="92" />
        <line className="target-line" x1="0" x2="100" y1={targetY} y2={targetY} />
        <polyline className="plan-line" points={points(planned)} />
        <polyline className="actual-line" points={points(actual)} />
      </svg>
    </div>
  );
}

function chartY(value, max) {
  return 92 - (value / max) * 78;
}

function Metric({ label, value, color }) {
  return (
    <div className="metric-line">
      <span style={{ background: color }} />
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function Resources({ onHelp }) {
  const resourceMock = useMemo(() => mockApi.resources.getResourceSnapshot(), []);
  const [selectedMemberIds, setSelectedMemberIds] = useState(['yamada']);
  const [range, setRange] = useState('week');
  const [resourceRange, setResourceRange] = useState(() => getDefaultResourceRange('week'));
  const [selectedSchedule, setSelectedSchedule] = useState({ memberId: 'yamada', date: PROTOTYPE_BASE_DATE });
  const [reservedEvent, setReservedEvent] = useState(null);
  const [manualResourceItems, setManualResourceItems] = useState([]);
  const [selectedBacklogGroupId, setSelectedBacklogGroupId] = useState(null);
  const [resourceWarning, setResourceWarning] = useState(null);
  const selectedMembers = resourceMock.members.filter((member) => selectedMemberIds.includes(member.id));
  const dates = getResourceDates(resourceRange);
  const resourceDataSource = useMemo(() => ({
    ...resourceMock,
    resourceItems: [...resourceMock.resourceItems, ...manualResourceItems]
  }), [resourceMock, manualResourceItems]);
  const memberPlans = buildResourcePlans(selectedMembers, dates, resourceDataSource);
  const backlogGroups = useMemo(() => buildResourceBacklogGroups(selectedMembers, dates, resourceDataSource), [selectedMembers, dates, resourceDataSource]);
  const selectedBacklogGroup = backlogGroups.find((group) => group.id === selectedBacklogGroupId) || backlogGroups[0] || null;
  const validSelectedMemberId = selectedMemberIds.includes(selectedSchedule.memberId)
    ? selectedSchedule.memberId
    : selectedMemberIds[0];
  const validSelectedDate = dates.includes(selectedSchedule.date)
    ? selectedSchedule.date
    : dates[0];
  const selectedPlan = memberPlans.find((plan) => plan.member.id === validSelectedMemberId) || memberPlans[0];
  const selectedDay = selectedPlan?.days.find((day) => day.date === validSelectedDate) || selectedPlan?.days[0];
  const resourceTotals = getResourceTotals(memberPlans);
  const daySummaries = getDailyResourceSummaries(memberPlans, dates);

  function selectSchedule(memberId, date) {
    setSelectedSchedule({ memberId, date });
  }

  function changeRange(nextRange) {
    const nextResourceRange = getDefaultResourceRange(nextRange);
    setRange(nextRange);
    setResourceRange(nextResourceRange);
    setSelectedSchedule((current) => ({ memberId: current.memberId, date: nextResourceRange.start }));
  }

  function changeResourceRange(nextRange) {
    setResourceRange(nextRange);
    setSelectedSchedule((current) => ({ memberId: current.memberId, date: nextRange.start }));
  }

  function placeBacklogItemOnDay(payload, memberId, date) {
    const records = resolveBacklogDragRecords(payload, backlogGroups, memberId);
    if (!records.length) return;
    const plan = memberPlans.find((item) => item.member.id === memberId);
    const day = plan?.days.find((item) => item.date === date);
    const duration = roundHours(records.reduce((sum, record) => sum + (record.remaining || getTaskRemainingHours(record.task)), 0));
    if (!duration) return;
    const usedHours = roundHours((day?.schedules || []).reduce((sum, item) => sum + item.duration, 0));
    const projectedHours = roundHours(usedHours + duration);
    if (projectedHours > 8) {
      setResourceWarning(`${plan?.member.name || '対象者'} の ${formatResourceDate(date)} は ${projectedHours}h になります。8hを超えていますが、仮配置しました。`);
    } else {
      setResourceWarning(null);
    }
    setManualResourceItems((current) => {
      let nextStart = getNextScheduleStart(day?.schedules || []);
      const newItems = records.map((record, index) => {
        const itemDuration = roundHours(record.remaining || getTaskRemainingHours(record.task));
        const item = {
          id: `manual-${record.task.id}-${memberId}-${date}-${current.length + index + 1}`,
          memberId,
          taskId: record.task.id,
          date,
          start: nextStart,
          duration: itemDuration,
          type: record.task.type,
          label: record.task.name,
          fixed: false,
          scheduled: true
        };
        nextStart = roundHours(nextStart + itemDuration);
        return item;
      });
      return [...current, ...newItems];
    });
  }

  return (
    <section className="screen-grid resource-screen">
      <div className="toolbar panel">
        <label>
          表示単位
          <select value={range} onChange={(event) => changeRange(event.target.value)}>
            <option value="day">日</option>
            <option value="week">週</option>
            <option value="month">月</option>
          </select>
        </label>
        <label>
          対象
          <CheckboxDropdown
            items={resourceMock.members.map((member) => ({ id: member.id, label: member.name }))}
            selectedIds={selectedMemberIds}
            onChange={setSelectedMemberIds}
            icon={Users}
            emptyLabel="対象者を選択"
          />
        </label>
        <label>
          期間
          <ResourceRangePicker value={resourceRange} onApply={changeResourceRange} />
        </label>
        <HelpButton title="リソース配置" body="時間指定がある予定は時間帯ブロックとして表示します。時間指定がないタスクは具体的な予定にはせず、見積残を直近の空き枠へ積んだ量として表示します。" />
      </div>

      <section className="panel resource-board">
        <div className="resource-board-actions">
          <AiActionMenu
            items={aiMenus.resources}
            helpTitle="リソース管理のAI"
            helpBody="実際のサービスでは、ここでAIが未固定タスク、期限、優先度、空きリソースを見て割り当て案を作ります。予定変更が必要な場合は、関係者への変更依頼文も下書きできます。"
          />
        </div>
        {selectedMembers.length > 1 ? (
          <div className="resource-summary-strip">
            <Metric label="リソース" value={`${resourceTotals.resourceHours}h`} color="#2563eb" />
            <Metric label="見積もりタスク" value={`${resourceTotals.estimatedHours}h`} color="#f97316" />
            <Metric label="完了タスク" value={`${resourceTotals.completedHours}h (${resourceTotals.completionRate}%)`} color="#16a34a" />
          </div>
        ) : null}
        <div className="resource-scroll-area">
          {range === 'month' ? (
            <MonthResourceView
              plans={memberPlans}
              selectedDate={validSelectedDate}
              selectedMemberId={validSelectedMemberId}
              onSelectDay={selectSchedule}
              onDropBacklog={placeBacklogItemOnDay}
            />
          ) : (
            <div className="member-calendar-list">
              {memberPlans.map((plan) => (
                <section className="member-calendar-section" key={plan.member.id}>
                  <div className="member-calendar-head">
                    <strong>{plan.member.name}</strong>
                    <span>R {plan.totals.resourceHours}h</span>
                    <span>見積 {plan.totals.estimatedHours}h</span>
                    <span>完了 {plan.totals.completedHours}h ({plan.totals.completionRate}%)</span>
                  </div>
                  <div className="calendar-grid member-calendar-grid" style={{ gridTemplateColumns: `repeat(${dates.length}, minmax(190px, 1fr))`, minWidth: `${dates.length * 190}px` }}>
                    {dates.map((date) => (
                      <div className="calendar-head" key={date}>
                        <span>{formatResourceDate(date)}</span>
                        <CalendarDateMetrics summary={plan.days.find((day) => day.date === date)?.summary} />
                      </div>
                    ))}
                    {plan.days.map((day) => (
                      <DayColumn
                        day={day}
                        key={`${plan.member.id}-${day.date}`}
                        memberId={plan.member.id}
                        onOpenReserved={setReservedEvent}
                        onDropBacklog={placeBacklogItemOnDay}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
        {range === 'month' && selectedPlan && selectedDay ? (
          <SelectedDaySchedule plan={selectedPlan} day={selectedDay} onOpenReserved={setReservedEvent} onDropBacklog={placeBacklogItemOnDay} />
        ) : null}
        {resourceWarning ? (
          <div className="resource-warning" role="alert">
            {resourceWarning}
          </div>
        ) : null}
        <UnfixedTaskPool
          groups={backlogGroups}
          selectedGroup={selectedBacklogGroup}
          selectedGroupId={selectedBacklogGroup?.id}
          onSelectGroup={setSelectedBacklogGroupId}
        />
      </section>
      {reservedEvent ? (
        <ReservedEventModal item={reservedEvent} onClose={() => setReservedEvent(null)} />
      ) : null}
    </section>
  );
}

function CalendarDateMetrics({ summary }) {
  if (!summary) return null;
  const metrics = [
    { key: 'R', label: 'リソース', value: summary.resourceHours, className: 'resource' },
    { key: 'F', label: '固定リソース', value: summary.fixedHours, className: 'fixed' },
    { key: 'D', label: '完了タスク', value: summary.completedHours, className: 'done' }
  ];
  return (
    <small className="calendar-date-metrics">
      {metrics.map((metric) => (
        <span className={`date-metric ${metric.className}`} key={metric.key} title={`${metric.label}: ${metric.value}h`}>
          <b>{metric.key}</b>{metric.value}h
        </span>
      ))}
    </small>
  );
}

function UnfixedTaskPool({ groups, selectedGroup, selectedGroupId, onSelectGroup }) {
  return (
    <section className="resource-backlog-panel" aria-label="未固定タスク">
      <div className="resource-backlog-head">
        <div>
          <p className="eyebrow">Deliverable backlog</p>
          <h2>未固定タスク（成果物別）</h2>
        </div>
        <span>{groups.reduce((sum, group) => sum + group.count, 0)}件 / {roundHours(groups.reduce((sum, group) => sum + group.hours, 0))}h</span>
      </div>
      {groups.length ? (
        <>
          <div className="resource-backlog-tags">
            {groups.map((group) => (
              <button
                className={selectedGroupId === group.id ? 'resource-backlog-tag active' : 'resource-backlog-tag'}
                draggable
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                onDragStart={(event) => setResourceDragPayload(event, { kind: 'group', groupId: group.id })}
                style={{ '--tag-color': getTypeColor(group.type) || '#f97316' }}
                title="ドラッグしてカレンダーに仮配置"
                type="button"
              >
                <strong>{group.name}</strong>
                <span>{group.contextName} / {group.count}件 / {group.hours}h</span>
              </button>
            ))}
          </div>
          {selectedGroup ? (
            <div className="resource-backlog-detail">
              <div className="resource-backlog-detail-head">
                <strong>{selectedGroup.name}</strong>
                <small>{selectedGroup.contextName}</small>
                <span>{selectedGroup.count}件 / {selectedGroup.hours}h</span>
              </div>
              <div className="resource-backlog-task-list">
                {selectedGroup.tasks.map((record) => (
                  <article
                    className="resource-backlog-task"
                    draggable
                    key={record.task.id}
                    onDragStart={(event) => setResourceDragPayload(event, { kind: 'task', taskId: record.task.id })}
                    title="ドラッグしてカレンダーに仮配置"
                  >
                    <div className="resource-backlog-task-card-head">
                      <div>
                        <a href={record.task.displayNo ? getTaskDetailHash(record.task.displayNo) : '#/tasks'}>{record.task.name}</a>
                        <small>{getAssigneeName(record.task)} / {record.task.type}</small>
                      </div>
                      <PriorityBadge priority={record.task.priority} />
                    </div>
                    <div className="resource-backlog-task-card-meta">
                      <span>完了日 {formatDateLabel(getTaskSortDate(record.task))}</span>
                      <span>残り {record.remaining}h</span>
                      <span>{record.task.displayNo ? `#${record.task.displayNo}` : '新規'}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="resource-backlog-empty">表示条件内の未固定タスクはありません</div>
      )}
    </section>
  );
}

function DayColumn({ day, memberId, isSelected = false, onOpenReserved, onSelectDay, onDropBacklog }) {
  function handleKeyDown(event) {
    if (!onSelectDay) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectDay();
    }
  }

  function handleDrop(event) {
    if (!onDropBacklog || !memberId) return;
    event.preventDefault();
    event.stopPropagation();
    const payload = getResourceDragPayload(event);
    if (payload) {
      onDropBacklog(payload, memberId, day.date);
    }
  }

  return (
    <div
      className={`${isSelected ? 'day-column selected' : 'day-column'} ${day.overCapacityHours > 0 ? 'over-capacity' : ''}`}
      onClick={onSelectDay}
      onDragOver={(event) => {
        if (onDropBacklog) event.preventDefault();
      }}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      role={onSelectDay ? 'button' : undefined}
      tabIndex={onSelectDay ? 0 : undefined}
    >
      {day.schedules.map((item) => (
        <ResourceScheduleBlock item={item} key={item.id} onOpenReserved={onOpenReserved} />
      ))}
      {day.queuedHours > 0 && (
        <div className="floating-workload" style={{ borderLeftColor: getTypeColor(day.queueTypes[0]) || '#f97316' }}>
          <span>未固定タスク</span>
          <strong>{day.queuedHours}h</strong>
        </div>
      )}
      {day.overCapacityHours > 0 && (
        <div className="capacity-warning">8h超過 +{day.overCapacityHours}h</div>
      )}
      {day.emptyHours > 0 && <div className="empty-block">空き {day.emptyHours}h</div>}
    </div>
  );
}

function ResourceScheduleBlock({ item, onOpenReserved }) {
  const task = item.taskId?.startsWith('task-') ? getNodeById(item.taskId) : null;
  const href = task?.displayNo ? getTaskDetailHash(task.displayNo) : null;
  const className = item.fixed ? 'resource-block fixed' : 'resource-block scheduled';
  const body = (
    <>
      <span>{item.type} / {formatTimeRange(item.start, item.duration)}</span>
      <strong>{item.label}</strong>
      <small>{item.duration}h {item.fixed ? '固定予定' : '時間指定タスク'}</small>
    </>
  );

  if (item.fixed) {
    return (
      <button
        className={className}
        onClick={(event) => {
          event.stopPropagation();
          onOpenReserved(item);
        }}
        style={{ minHeight: `${Math.max(item.duration * 30, 50)}px`, borderLeftColor: getTypeColor(item.type) }}
        title="Reserved予定詳細を開く"
        type="button"
      >
        {body}
      </button>
    );
  }

  if (href) {
    return (
      <a
        className={className}
        href={href}
        onClick={(event) => event.stopPropagation()}
        style={{ minHeight: `${Math.max(item.duration * 30, 50)}px`, borderLeftColor: getTypeColor(item.type) }}
        title="チケット詳細を開く"
      >
        {body}
      </a>
    );
  }

  return (
    <div
      className={className}
      style={{ minHeight: `${Math.max(item.duration * 30, 50)}px`, borderLeftColor: getTypeColor(item.type) }}
    >
      {body}
    </div>
  );
}

function ResourceRangePicker({ value, onApply, applyLabel = '決定' }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value.start, value.end]);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!pickerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  function selectDate(date) {
    if (!draft.start || draft.end) {
      setDraft({ start: date, end: null });
      return;
    }

    const [start, end] = date < draft.start ? [date, draft.start] : [draft.start, date];
    setDraft({ start, end });
  }

  function applyRange() {
    onApply({ start: draft.start, end: draft.end || draft.start });
    setOpen(false);
  }

  const days = getPrototypeMonthCalendarDays();

  return (
    <div className="range-picker" ref={pickerRef}>
      <button className="range-picker-button" type="button" onClick={() => setOpen((current) => !current)}>
        <CalendarDays size={14} />
        <span>{getResourceRangeLabel(getResourceDates(value))}</span>
      </button>
      {open ? (
        <div className="range-calendar-popover">
          <div className="range-calendar-head">
            <div>
              <strong>2026年6月</strong>
              <span>開始日と終了日を順に選択</span>
            </div>
            <button className="range-apply-button" onClick={applyRange} type="button">
              {applyLabel}
            </button>
          </div>
          <div className="range-calendar-weekdays">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="range-calendar-grid">
            {days.map((day) => {
              const inRange = draft.start && draft.end && day.date >= draft.start && day.date <= draft.end;
              const selected = day.date === draft.start || day.date === draft.end;
              return (
                <button
                  className={`${day.inMonth ? '' : 'muted'} ${inRange ? 'in-range' : ''} ${selected ? 'selected' : ''}`}
                  disabled={!day.inMonth}
                  key={day.date}
                  onClick={() => selectDate(day.date)}
                  type="button"
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReservedEventModal({ item, onClose }) {
  const detail = getReservedEventDetail(item);

  return (
    <div className="reserved-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="reserved-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="reserved-modal-head">
          <div>
            <p className="eyebrow">Reserved schedule</p>
            <h2>{item.label}</h2>
          </div>
          <button aria-label="閉じる" onClick={onClose} type="button">×</button>
        </div>
        <dl className="reserved-detail-list">
          <div>
            <dt>日時</dt>
            <dd>{formatResourceDate(item.date)} {formatTimeRange(item.start, item.duration)}</dd>
          </div>
          <div>
            <dt>カレンダー</dt>
            <dd>{detail.calendar}</dd>
          </div>
          <div>
            <dt>会議リンク</dt>
            <dd><a href={detail.meetingUrl}>{detail.meetingUrl}</a></dd>
          </div>
          <div>
            <dt>場所</dt>
            <dd>{detail.location}</dd>
          </div>
          <div>
            <dt>参加者</dt>
            <dd>{detail.participants.join('、')}</dd>
          </div>
          <div>
            <dt>説明</dt>
            <dd>{detail.description}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function SelectedDaySchedule({ plan, day, onOpenReserved, onDropBacklog }) {
  return (
    <section className="selected-day-panel">
      <div className="selected-day-head">
        <strong>{plan.member.name} / {formatResourceDate(day.date)} のスケジュール</strong>
        <span>リソース 8h / 固定 {day.fixedHours}h / 完了 {day.completedHours}h</span>
      </div>
      <div className="selected-day-grid">
        <article className="selected-day-card">
          <div className="selected-day-member">
            <strong>{plan.member.name}</strong>
            <span>見積 {plan.totals.estimatedHours}h / 完了 {plan.totals.completedHours}h ({plan.totals.completionRate}%)</span>
          </div>
          <DayColumn day={day} memberId={plan.member.id} onOpenReserved={onOpenReserved} onDropBacklog={onDropBacklog} />
        </article>
      </div>
    </section>
  );
}

function MonthResourceView({ plans, selectedDate, selectedMemberId, onSelectDay, onDropBacklog }) {
  return (
    <div className="month-resource-grid">
      {plans.map((plan) => (
        <article className="month-resource-card" key={plan.member.id}>
          <div className="month-resource-head">
            <div>
              <strong>{plan.member.name}</strong>
              <span>リソース {plan.totals.resourceHours}h / 見積 {plan.totals.estimatedHours}h / 完了 {plan.totals.completedHours}h ({plan.totals.completionRate}%)</span>
            </div>
            <p>{plan.zeroDate ? `${formatResourceDate(plan.zeroDate)}に未固定0h` : '月内では未固定が残る'}</p>
          </div>
          <div className="month-resource-metrics">
            <span>時間指定 {plan.totals.fixedHours}h</span>
            <span>未固定 {plan.totals.queuedHours}h</span>
            <span>空き {plan.totals.emptyHours}h</span>
          </div>
          <div className="month-day-grid">
            {plan.days.map((day) => {
              const used = Math.min(day.fixedHours + day.queuedHours, 8);
              const usage = Math.round((used / 8) * 100);
              return (
                <button
                  className={plan.member.id === selectedMemberId && day.date === selectedDate ? 'month-day-cell selected' : 'month-day-cell'}
                  key={day.date}
                  onClick={() => onSelectDay(plan.member.id, day.date)}
                  onDragOver={(event) => {
                    if (onDropBacklog) event.preventDefault();
                  }}
                  onDrop={(event) => {
                    if (!onDropBacklog) return;
                    event.preventDefault();
                    event.stopPropagation();
                    const payload = getResourceDragPayload(event);
                    if (payload) onDropBacklog(payload, plan.member.id, day.date);
                  }}
                  type="button"
                >
                  <div className="month-day-head">
                    <span>{formatMonthDay(day.date)}</span>
                    <strong>{usage}%</strong>
                  </div>
                  <CalendarDateMetrics summary={day.summary} />
                  <div className="month-capacity-bar">
                    <span className="bar-fixed" style={{ width: `${(day.fixedHours / 8) * 100}%` }} />
                    <span className="bar-queued" style={{ width: `${(day.queuedHours / 8) * 100}%` }} />
                  </div>
                  <small>固定 {day.fixedHours}h</small>
                  <b>未固定 {day.queuedHours}h</b>
                  <em>空き {day.emptyHours}h</em>
                </button>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}

function buildResourceBacklogGroups(selectedMembers, dates, dataSource = mockApi.resources.getResourceSnapshot()) {
  const dateSet = new Set(dates);
  const memberIds = new Set(selectedMembers.map((member) => member.id));
  const scheduleItems = dataSource.resourceItems;
  const scheduledHoursByTask = scheduleItems
    .filter((item) => item.scheduled && dateSet.has(item.date))
    .reduce((map, item) => {
      map[item.taskId] = (map[item.taskId] || 0) + item.duration;
      return map;
    }, {});
  const groups = new Map();

  for (const record of collectTaskTicketRecords(dataSource.workTree)) {
    const task = record.task;
    if (!memberIds.has(task.assigneeId) || !isOpenTask(task)) continue;
    const remaining = roundHours(Math.max(getTaskRemainingHours(task) - (scheduledHoursByTask[task.id] || 0), 0));
    if (remaining <= 0) continue;
    const groupNode = record.deliverable || task;
    const contextNode = task.type === 'Project' ? record.project : record.category;
    const groupName = groupNode?.name || task.name;
    const groupId = `deliverable-${groupNode?.id || task.id}`;
    const group = groups.get(groupId) || {
      id: groupId,
      name: groupName,
      contextName: contextNode?.name || task.type,
      deliverableId: groupNode?.id || null,
      type: task.type,
      count: 0,
      hours: 0,
      tasks: []
    };
    group.count += 1;
    group.hours = roundHours(group.hours + remaining);
    group.tasks.push({ ...record, remaining });
    groups.set(groupId, group);
  }

  return [...groups.values()]
    .map((group) => ({ ...group, tasks: group.tasks.sort(compareResourceTaskRecords) }))
    .sort((a, b) => compareResourceTaskRecords(a.tasks[0], b.tasks[0]));
}

function buildResourcePlans(selectedMembers, dates, dataSource = mockApi.resources.getResourceSnapshot()) {
  const dateSet = new Set(dates);
  const tasks = collectTaskTickets(dataSource.workTree);
  const scheduleItems = dataSource.resourceItems;
  const scheduledHoursByTask = scheduleItems
    .filter((item) => item.scheduled && dateSet.has(item.date))
    .reduce((map, item) => {
      map[item.taskId] = (map[item.taskId] || 0) + item.duration;
      return map;
    }, {});

  return selectedMembers.map((member) => {
    const memberTasks = tasks.filter((task) => task.assigneeId === member.id);
    const estimatedHours = roundHours(memberTasks.reduce((sum, task) => sum + Number(task.estimate || 0), 0));
    const completedHours = roundHours(memberTasks.reduce((sum, task) => sum + Number(task.actual || 0), 0));
    const completionRate = estimatedHours ? Math.round((completedHours / estimatedHours) * 100) : 0;
    const queue = tasks
      .filter((task) => task.assigneeId === member.id && isOpenTask(task))
      .map((task) => ({
        id: task.id,
        name: task.name,
        type: task.type,
        priority: task.priority,
        completedDate: task.completedDate,
        startDate: task.startDate,
        remaining: Math.max(getTaskRemainingHours(task) - (scheduledHoursByTask[task.id] || 0), 0)
      }))
      .sort(compareResourceQueueItems)
      .filter((task) => task.remaining > 0);
    const backlogHours = roundHours(queue.reduce((sum, task) => sum + task.remaining, 0));
    let zeroDate = backlogHours === 0 ? dates[0] : null;

    const days = dates.map((date) => {
      const schedules = [
        getDailyStandupItem(member, date),
        ...scheduleItems.filter((item) => item.taskId !== 'reserved-standup' && item.memberId === member.id && item.date === date && isTimedResourceItem(item))
      ].sort((a, b) => a.start - b.start);
      const fixedHours = roundHours(schedules.reduce((sum, item) => sum + item.duration, 0));
      const completedDayHours = roundHours(schedules.reduce((sum, item) => {
        const task = tasks.find((candidate) => candidate.id === item.taskId);
        return normalizeStatus(task?.status) === 'done' ? sum + item.duration : sum;
      }, 0));
      let capacity = Math.max(8 - fixedHours, 0);
      const queueItems = [];
      let queuedHours = 0;

      for (const task of queue) {
        if (capacity <= 0) break;
        if (task.remaining <= 0) continue;
        const allocated = Math.min(task.remaining, capacity);
        task.remaining = roundHours(task.remaining - allocated);
        capacity = roundHours(capacity - allocated);
        queuedHours = roundHours(queuedHours + allocated);
        if (!queueItems.some((item) => item.id === task.id)) {
          queueItems.push({ id: task.id, name: task.name, type: task.type });
        }
      }

      if (!zeroDate && queue.every((task) => task.remaining <= 0)) {
        zeroDate = date;
      }

      return {
        memberId: member.id,
        date,
        schedules,
        fixedHours,
        completedHours: completedDayHours,
        queuedHours,
        queueItems: queueItems.slice(0, 2),
        queueTypes: [...new Set(queueItems.map((item) => item.type))],
        emptyHours: roundHours(Math.max(8 - fixedHours - queuedHours, 0)),
        overCapacityHours: roundHours(Math.max(fixedHours + queuedHours - 8, 0)),
        summary: {
          resourceHours: 8,
          fixedHours,
          completedHours: completedDayHours
        }
      };
    });

    return {
      member,
      days,
      zeroDate,
      totals: {
        resourceHours: dates.length * 8,
        estimatedHours,
        completedHours,
        completionRate,
        backlogHours,
        fixedHours: roundHours(days.reduce((sum, day) => sum + day.fixedHours, 0)),
        queuedHours: roundHours(days.reduce((sum, day) => sum + day.queuedHours, 0)),
        emptyHours: roundHours(days.reduce((sum, day) => sum + day.emptyHours, 0))
      }
    };
  });
}

function getResourceTotals(memberPlans) {
  const resourceHours = roundHours(memberPlans.reduce((sum, plan) => sum + plan.totals.resourceHours, 0));
  const estimatedHours = roundHours(memberPlans.reduce((sum, plan) => sum + plan.totals.estimatedHours, 0));
  const completedHours = roundHours(memberPlans.reduce((sum, plan) => sum + plan.totals.completedHours, 0));
  const completionRate = estimatedHours ? Math.round((completedHours / estimatedHours) * 100) : 0;
  return { resourceHours, estimatedHours, completedHours, completionRate };
}

function getDailyResourceSummaries(memberPlans, dates) {
  return dates.reduce((summaries, date) => {
    const dayPlans = memberPlans.map((plan) => plan.days.find((day) => day.date === date)).filter(Boolean);
    summaries[date] = {
      resourceHours: roundHours(dayPlans.reduce((sum, day) => sum + day.summary.resourceHours, 0)),
      fixedHours: roundHours(dayPlans.reduce((sum, day) => sum + day.summary.fixedHours, 0)),
      completedHours: roundHours(dayPlans.reduce((sum, day) => sum + day.summary.completedHours, 0))
    };
    return summaries;
  }, {});
}

function getTypeColor(type) {
  return mockApi.master.getTypeColors()[type];
}

function collectTaskTickets(nodes) {
  const tasks = [];
  (function walk(items = []) {
    for (const item of items) {
      if (item.kind === 'タスクチケット') tasks.push(item);
      if (item.children?.length) walk(item.children);
    }
  })(nodes);
  return tasks;
}

function collectTaskTicketRecords(nodes) {
  const records = [];

  (function walk(items = [], path = []) {
    for (const item of items) {
      const nextPath = [...path, item];
      if (item.kind === 'タスクチケット') {
        records.push({
          task: item,
          path: nextPath,
          project: nextPath.find((node) => node.kind === 'Project') || null,
          category: nextPath.find((node) => node.kind === 'カテゴリ') || null,
          deliverable: nextPath.find((node) => node.kind === '成果物チケット') || null,
          deliverableName: nextPath.find((node) => node.kind === '成果物チケット')?.name || '-'
        });
      }
      if (item.children?.length) walk(item.children, nextPath);
    }
  })(nodes);

  return records;
}

function compareResourceQueueItems(a, b) {
  return compareResourceTaskLike(a, b);
}

function compareResourceTaskRecords(a, b) {
  return compareResourceTaskLike(a?.task || a, b?.task || b);
}

function compareResourceTaskLike(a, b) {
  const dateCompare = getTaskSortDate(a).localeCompare(getTaskSortDate(b));
  if (dateCompare !== 0) return dateCompare;
  const priorityCompare = getPriorityRank(a?.priority) - getPriorityRank(b?.priority);
  if (priorityCompare !== 0) return priorityCompare;
  return String(a?.name || '').localeCompare(String(b?.name || ''), 'ja');
}

function getTaskSortDate(task) {
  return task?.completedDate || task?.dueDate || task?.targetDate || task?.startDate || '9999-12-31';
}

function getPriorityRank(priority) {
  return priorityOptions.find((option) => option.value === normalizePriority(priority))?.rank ?? 2;
}

function normalizePriority(priority) {
  if (priority === 'critical' || priority === 'クリティカル') return 'critical';
  if (priority === 'high' || priority === '高') return 'high';
  if (priority === 'medium' || priority === '中') return 'medium';
  if (priority === 'low' || priority === '低') return 'low';
  return 'medium';
}

function getPriorityLabel(priority) {
  return priorityOptions.find((option) => option.value === normalizePriority(priority))?.label || '中';
}

function setResourceDragPayload(event, payload) {
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('application/beyondr-resource', JSON.stringify(payload));
}

function getResourceDragPayload(event) {
  try {
    const raw = event.dataTransfer.getData('application/beyondr-resource');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function resolveBacklogDragRecords(payload, groups, memberId) {
  if (!payload) return [];
  if (payload.kind === 'task') {
    const record = groups.flatMap((group) => group.tasks).find((item) => item.task.id === payload.taskId);
    return record ? [record] : [];
  }
  if (payload.kind === 'group') {
    const group = groups.find((item) => item.id === payload.groupId);
    return (group?.tasks || []).filter((record) => record.task.assigneeId === memberId);
  }
  return [];
}

function getNextScheduleStart(schedules) {
  const latestEnd = schedules.reduce((latest, item) => Math.max(latest, Number(item.start || 9) + Number(item.duration || 0)), 9);
  return roundHours(Math.max(9, latestEnd));
}

function isTimedResourceItem(item) {
  return item.fixed || item.scheduled;
}

function getDailyStandupItem(member, date) {
  return {
    id: `reserved-standup-${member.id}-${date}`,
    memberId: member.id,
    taskId: 'reserved-standup',
    date,
    start: 9,
    duration: 0.5,
    type: 'Reserved',
    label: '朝会',
    fixed: true
  };
}

function isOpenTask(task) {
  const status = normalizeStatus(task.status);
  return status !== 'done' && status !== 'discard';
}

function getTaskRemainingHours(task) {
  return Math.max(Number(task.estimate || 0) - Number(task.actual || 0), 0);
}

function getDefaultResourceRange(range) {
  if (range === 'day') return { start: PROTOTYPE_BASE_DATE, end: PROTOTYPE_BASE_DATE };
  if (range === 'week') return { start: PROTOTYPE_BASE_DATE, end: '2026-06-05' };
  return { start: PROTOTYPE_MONTH_START, end: PROTOTYPE_MONTH_END };
}

function getResourceDates(range) {
  const end = range.end || range.start;
  const dates = [];
  const date = new Date(`${range.start}T00:00:00+09:00`);
  const endDate = new Date(`${end}T00:00:00+09:00`);
  while (date <= endDate) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(toDateKey(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getResourceRangeLabel(dates) {
  if (!dates.length) return '';
  return `${formatResourceDate(dates[0])} - ${formatResourceDate(dates.at(-1))}`;
}

function getPrototypeMonthCalendarDays() {
  const first = new Date(`${PROTOTYPE_MONTH_START}T00:00:00+09:00`);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date: toDateKey(date),
      label: date.getDate(),
      inMonth: date.getMonth() === first.getMonth()
    };
  });
}

function getReservedEventDetail(item) {
  const details = {
    'reserved-standup': {
      calendar: 'Beyond R / Delivery',
      meetingUrl: 'https://meet.google.com/br-standup-061',
      location: 'Google Meet',
      participants: ['山田太郎', '佐藤花子', '鈴木一郎', '田中次郎'],
      description: '当日のブロッカー、レビュー待ち、Reserved増減を確認します。'
    },
    'reserved-company': {
      calendar: 'Corporate',
      meetingUrl: 'https://meet.google.com/company-weekly',
      location: 'Google Meet',
      participants: ['佐藤花子', '山田太郎', '経営会議メンバー'],
      description: '全社共有と優先度変更の確認です。'
    },
    'reserved-design-review': {
      calendar: 'Product Design',
      meetingUrl: 'https://meet.google.com/design-review',
      location: 'Google Meet',
      participants: ['鈴木一郎', '山田太郎', 'デザインチーム'],
      description: '画面仕様とレビューコメントを確認します。'
    },
    'reserved-meeting': {
      calendar: 'Operations',
      meetingUrl: 'https://meet.google.com/ops-move',
      location: '外出 / Google Meet',
      participants: ['田中次郎', '佐藤花子'],
      description: '移動と定例会議の固定予定です。'
    },
    'reserved-review': {
      calendar: 'Beyond R / Review',
      meetingUrl: 'https://meet.google.com/br-review-063',
      location: 'Google Meet',
      participants: ['山田太郎', '鈴木一郎', 'レビュー担当者'],
      description: '週次レビューと次アクションの確認です。'
    }
  };

  return details[item.taskId] || {
    calendar: 'Beyond R',
    meetingUrl: 'https://meet.google.com/beyond-r',
    location: 'Google Meet',
    participants: ['山田太郎', '佐藤花子'],
    description: 'Google Calendar から取得する想定のReserved予定です。'
  };
}

function formatResourceDate(date) {
  const [, month, day] = date.split('-');
  return `${Number(month)}/${Number(day)}`;
}

function formatMonthDay(date) {
  const parsed = new Date(`${date}T00:00:00+09:00`);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${parsed.getDate()}(${weekdays[parsed.getDay()]})`;
}

function formatTimeRange(start, duration) {
  return `${formatHour(start)}-${formatHour(start + duration)}`;
}

function formatHour(value) {
  const hour = Math.floor(value);
  const minute = Math.round((value - hour) * 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function roundHours(value) {
  return Math.round(value * 10) / 10;
}

function Tasks({ onHelp }) {
  const taskWorkTree = useMemo(() => mockApi.tasks.getWorkTree(), []);
  const taskMembers = useMemo(() => mockApi.master.getMembers(), []);
  const [scopeId, setScopeId] = useState(null);
  const [selectedId, setSelectedId] = useState('project-root');
  const [expandedIds, setExpandedIds] = useState(() => new Set([
    'project-root',
    'project-beyond-r',
    'project-portfolio-support',
    'ms-resource',
    'deliverable-resource',
    'ms-portfolio-intake',
    'deliverable-request-board',
    'ms-task',
    'adhoc-root',
    'adhoc-client',
    'adhoc-deliverable-sales-brief',
    'adhoc-deliverable-inquiry-report',
    'explore-root',
    'explore-ai',
    'explore-deliverable-ai'
  ]));
  const typeFilterOptions = useMemo(() => [
    { id: 'Projects', label: 'Projects' },
    { id: '管理区分', label: '管理区分' },
    { id: 'Project', label: 'Project' },
    { id: 'マイルストーン', label: 'マイルストーン' },
    { id: 'カテゴリ', label: 'カテゴリ' },
    { id: '成果物チケット', label: '成果物' },
    { id: 'タスクチケット', label: 'タスク' }
  ], []);
  const statusFilterOptions = useMemo(() => statusOptions.map((option) => ({ id: option.value, label: option.label })), []);
  const priorityFilterOptions = useMemo(() => priorityOptions.map((option) => ({ id: option.value, label: option.label })), []);
  const assigneeFilterOptions = useMemo(() => taskMembers.map((member) => ({ id: member.id, label: member.name })), [taskMembers]);
  const [typeFilterIds, setTypeFilterIds] = useState(() => typeFilterOptions.map((option) => option.id));
  const [statusFilterIds, setStatusFilterIds] = useState(() => statusFilterOptions.map((option) => option.id));
  const [priorityFilterIds, setPriorityFilterIds] = useState(() => priorityFilterOptions.map((option) => option.id));
  const [assigneeFilterIds, setAssigneeFilterIds] = useState(() => assigneeFilterOptions.map((option) => option.id));
  const [startDateFilter, setStartDateFilter] = useState({ mode: 'none', date: '' });
  const [completedDateFilter, setCompletedDateFilter] = useState({ mode: 'none', date: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [localTickets, setLocalTickets] = useState([]);
  const [detailViewId, setDetailViewId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [columnWidths, setColumnWidths] = useState({
    code: 82,
    kind: 108,
    status: 142,
    priority: 92,
    name: 380,
    assignee: 94,
    startDate: 104,
    completedDate: 104,
    hours: 96
  });
  const resizeStateRef = useRef(null);
  const tree = useMemo(() => mergeLocalTickets(taskWorkTree, localTickets), [taskWorkTree, localTickets]);
  const codeColumnWidth = useMemo(() => Math.max(88, getMaxDisplayNoLength(tree) * 10 + 24), [tree]);
  const scopeNode = scopeId ? getNodeById(scopeId, tree) : { id: 'all', kind: '表示スコープ', type: 'All', name: '全体WBS', children: tree };
  const selectedPath = findNodePath(selectedId, tree);
  const selectedNode = selectedPath.at(-1) || scopeNode;
  const detailViewNode = detailViewId ? getNodeById(detailViewId, tree) : null;
  const scopePath = scopeId ? findNodePath(scopeId, tree) : [];
  const activeWbsFilters = {
    typeFilterIds,
    statusFilterIds,
    priorityFilterIds,
    assigneeFilterIds,
    startDateFilter,
    completedDateFilter,
    searchTerm,
    typeFilterCount: typeFilterOptions.length,
    statusFilterCount: statusFilterOptions.length,
    priorityFilterCount: priorityFilterOptions.length,
    assigneeFilterCount: assigneeFilterOptions.length
  };
  const hasActiveWbsFilter = Boolean(searchTerm)
    || typeFilterIds.length !== typeFilterOptions.length
    || statusFilterIds.length !== statusFilterOptions.length
    || priorityFilterIds.length !== priorityFilterOptions.length
    || assigneeFilterIds.length !== assigneeFilterOptions.length
    || isDateFilterActive(startDateFilter)
    || isDateFilterActive(completedDateFilter);
  const shouldShowScopeChildren = scopeId && scopeNode?.children?.length && (expandedIds.has(scopeNode.id) || hasActiveWbsFilter);
  const rows = scopeId && scopeNode
    ? [
        {
          node: scopeNode,
          depth: Math.max(0, scopePath.length - 1),
          code: `scope-node-${scopeNode.id}`
        },
        ...(shouldShowScopeChildren ? buildWbsRows(scopeNode.children || [], expandedIds, activeWbsFilters, scopePath.length) : [])
      ]
    : buildWbsRows(scopeNode?.children || [], expandedIds, activeWbsFilters);

  useEffect(() => {
    const syncFromHash = () => {
      const nextDetailNo = getTaskDetailNoFromHash(window.location.hash);
      const nextScopeNo = getTaskScopeNoFromHash(window.location.hash);
      const nextDetailNode = nextDetailNo ? getNodeByDisplayNo(nextDetailNo, tree) : null;
      const nextScopeNode = nextScopeNo ? getNodeByDisplayNo(nextScopeNo, tree) : null;

      if (nextDetailNode) {
        setDetailViewId(nextDetailNode.id);
        setSelectedId(nextDetailNode.id);
        return;
      }

      setDetailViewId(null);
      if (nextScopeNode) {
        const scopeAnchor = getScopeAnchorNode(nextScopeNode, tree);
        setScopeId(scopeAnchor?.id || null);
        setSelectedId(scopeAnchor?.id || 'project-root');
        if (scopeAnchor?.id) {
          setExpandedIds((current) => new Set([...current, scopeAnchor.id]));
        }
        return;
      }

      if (window.location.hash === '#/tasks' || window.location.hash === '#/tasks/') {
        setScopeId(null);
        setSelectedId('project-root');
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [tree]);

  useEffect(() => {
    setColumnWidths((current) => (current.code >= codeColumnWidth ? current : { ...current, code: codeColumnWidth }));
  }, [codeColumnWidth]);

  useEffect(() => {
    function handleMove(event) {
      const state = resizeStateRef.current;
      if (!state) return;
      const delta = event.clientX - state.startX;
      const nextWidth = Math.max(state.minWidth, state.startWidth + delta);
      setColumnWidths((current) => ({ ...current, [state.key]: nextWidth }));
    }

    function handleUp() {
      resizeStateRef.current = null;
      document.body.classList.remove('resizing-columns');
    }

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, []);

  function beginColumnResize(event, key, minWidth = 60) {
    event.preventDefault();
    event.stopPropagation();
    resizeStateRef.current = {
      key,
      startX: event.clientX,
      startWidth: columnWidths[key],
      minWidth
    };
    document.body.classList.add('resizing-columns');
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  const tableTemplate = [
    `${columnWidths.code}px`,
    `${columnWidths.kind}px`,
    `${columnWidths.status}px`,
    `${columnWidths.priority}px`,
    `${columnWidths.name}px`,
    `${columnWidths.assignee}px`,
    `${columnWidths.startDate}px`,
    `${columnWidths.completedDate}px`,
    `${columnWidths.hours}px`
  ].join(' ');

  function toggleExpanded(nodeId) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  function drillInto(node) {
    if (!node?.children?.length) return;
    const scopeAnchor = getScopeAnchorNode(node, tree);
    setScopeId(scopeAnchor?.id || node.id);
    setSelectedId(scopeAnchor?.id || node.id);
    setDetailViewId(null);
    setExpandedIds((current) => new Set([...current, scopeAnchor?.id || node.id, node.id, ...(node.children || []).map((child) => child.id)]));
    const nextHash = scopeAnchor?.displayNo ? getTaskScopeHash(scopeAnchor.displayNo) : '#/tasks';
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }

  function moveScopeUp() {
    if (!scopeId) return;
    const parent = scopePath.at(-2);
    jumpScopeTo(parent || null);
  }

  function jumpScopeTo(node) {
    setScopeId(node?.id || null);
    setSelectedId(node?.id || 'project-root');
    setDetailViewId(null);
    if (node?.id) {
      setExpandedIds((current) => new Set([...current, node.id]));
    }
    const nextHash = node?.displayNo ? getTaskScopeHash(node.displayNo) : '#/tasks';
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }

  function openDetail(nodeOrId) {
    const id = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId?.id;
    const node = typeof nodeOrId === 'string'
      ? getNodeById(id, tree) || getNodeByDisplayNo(id, tree)
      : nodeOrId;
    if (!node) return;
    setSelectedId(node.id);
    setDetailViewId(node.id);
    const nextHash = node.displayNo ? getTaskDetailHash(node.displayNo) : '#/tasks';
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }

  function startInlineDraft(parentNode) {
    if (!parentNode || parentNode.kind === 'タスクチケット') return;
    const childKind = getDefaultNewKind(parentNode);
    const childType = parentNode.type === 'All' ? 'Project' : parentNode.type;
    const node = {
      id: `draft-${Date.now()}`,
      kind: childKind,
      type: childType,
      name: '',
      status: '編集中',
      priority: 'medium',
      assigneeId: '',
      estimate: 0,
      actual: 0,
      startDate: '',
      completedDate: '',
      isDraft: true
    };
    node.displayNo = getNextDisplayNo(tree, node.type);
    setLocalTickets((current) => [...current, { parentId: parentNode.id, node }]);
    setExpandedIds((current) => new Set([...current, parentNode.id]));
    setHoveredNodeId(parentNode.id);
    setSelectedId(parentNode.id);
  }

  function updateDraftTicket(nodeId, patch) {
    setLocalTickets((current) => current.map((ticket) => {
      if (ticket.node.id !== nodeId) return ticket;
      return { ...ticket, node: { ...ticket.node, ...patch } };
    }));
  }

  function commitDraftTicket(nodeId) {
    setLocalTickets((current) => current.map((ticket) => {
      if (ticket.node.id !== nodeId) return ticket;
      return { ...ticket, node: { ...ticket.node, isDraft: false, status: ticket.node.name ? '未着手' : '未着手' } };
    }));
  }

  function deleteDraftTicket(nodeId) {
    setLocalTickets((current) => current.filter((ticket) => ticket.node.id !== nodeId));
  }

  function expandAll() {
    const rootItems = scopeId && scopeNode ? [scopeNode] : tree;
    setExpandedIds((current) => new Set([...current, ...getExpandableNodeIds(rootItems)]));
  }

  function collapseAll() {
    const rootItems = scopeId && scopeNode ? [scopeNode] : tree;
    const targetIds = new Set(getExpandableNodeIds(rootItems));
    setExpandedIds((current) => new Set([...current].filter((id) => !targetIds.has(id))));
  }

  return (
    <section className="tasks-layout">
      {detailViewNode ? (
        <TicketDetailScreen
          node={detailViewNode}
          tree={tree}
          onBack={() => {
            const nextHash = scopeId && scopeNode?.displayNo ? getTaskScopeHash(scopeNode.displayNo) : '#/tasks';
            setDetailViewId(null);
            if (window.location.hash !== nextHash) {
              window.location.hash = nextHash;
            }
          }}
          onDrill={drillInto}
          onSelect={openDetail}
        />
      ) : (
        <section className="panel wbs-panel">
          <div className="wbs-toolbar">
          <div className="wbs-scope">
            <button className="scope-button" disabled={!scopeId} onClick={moveScopeUp} title="上位階層へ戻る" type="button">
              <ChevronLeft size={16} />
              <span>上位へ</span>
            </button>
            <button className="scope-button" onClick={() => {
              jumpScopeTo(null);
            }} type="button">
              全体WBS
            </button>
            {scopePath.length ? (
              <div className="wbs-breadcrumb">
                {scopePath.map((node) => (
                  <button className="wbs-breadcrumb-item" key={node.id} onClick={() => jumpScopeTo(node)} type="button">
                    {node.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="wbs-filters">
            <div className="wbs-toggle-actions" aria-label="WBS開閉操作">
              <button className="scope-button compact" onClick={expandAll} type="button">
                すべて開く
              </button>
              <button className="scope-button compact" onClick={collapseAll} type="button">
                すべて閉じる
              </button>
            </div>
          </div>
        </div>
        <div className="wbs-table" role="table" aria-label="WBS task table">
          <div className="wbs-head" role="row" style={{ gridTemplateColumns: tableTemplate }}>
            <span className="resizable-head">
              <span className="wbs-head-title"><span>#</span><HelpButton title="表示スコープ" body="この番号をクリックすると、そのチケットをトップにしたWBSへ切り替わります。詳細画面ではなく、表示範囲をそのチケット配下に絞るための入口です。" /></span>
              <button aria-label="#列を調整" className="column-resizer" onPointerDown={(event) => beginColumnResize(event, 'code', 70)} type="button" />
            </span>
            <span className="resizable-head">
              <span className="wbs-head-title">
                <span>タイプ</span>
                <HeaderMultiFilter
                  label="タイプ"
                  options={typeFilterOptions}
                  selectedIds={typeFilterIds}
                  onChange={setTypeFilterIds}
                />
              </span>
              <button aria-label="タイプ列を調整" className="column-resizer" onPointerDown={(event) => beginColumnResize(event, 'kind', 80)} type="button" />
            </span>
            <span className="resizable-head">
              <span className="wbs-head-title">
                <span>ステータス/進捗</span>
                <HelpButton
                  title="ステータス/進捗"
                  body="タスク行は現在のステータスを表示します。タスク以外の行は配下タスクの完了件数と、完了済みタスクの見積時間 / 全タスク見積時間で進捗率を表示します。例: 10件中6件doneなら6/10、見積20h中5h完了なら25%です。"
                />
                <HeaderMultiFilter
                  label="ステータス"
                  options={statusFilterOptions}
                  selectedIds={statusFilterIds}
                  onChange={setStatusFilterIds}
                />
              </span>
              <button aria-label="ステータス/進捗列を調整" className="column-resizer" onPointerDown={(event) => beginColumnResize(event, 'status', 96)} type="button" />
            </span>
            <span className="resizable-head">
              <span className="wbs-head-title">
                <span>優先度</span>
                <HeaderMultiFilter
                  label="優先度"
                  options={priorityFilterOptions}
                  selectedIds={priorityFilterIds}
                  onChange={setPriorityFilterIds}
                />
              </span>
              <button aria-label="優先度列を調整" className="column-resizer" onPointerDown={(event) => beginColumnResize(event, 'priority', 72)} type="button" />
            </span>
            <span className="resizable-head">
              <span className="wbs-head-title">
                <span>WBS / チケット</span>
                <HelpButton title="チケットの切り方" body="チケット名にカーソルを当てると、その配下へ子チケットを追加する小さいボタンが表示されます。追加した行は空欄のままでも保存でき、後から詳細画面で追記できます。" />
                <HeaderTextFilter value={searchTerm} onChange={setSearchTerm} />
              </span>
              <button aria-label="WBS / チケット列を調整" className="column-resizer" onPointerDown={(event) => beginColumnResize(event, 'name', 220)} type="button" />
            </span>
            <span className="resizable-head">
              <span className="wbs-head-title">
                <span>担当者</span>
              <HeaderMultiFilter
                label="担当者"
                options={assigneeFilterOptions}
                selectedIds={assigneeFilterIds}
                onChange={setAssigneeFilterIds}
              />
              </span>
              <button aria-label="担当者列を調整" className="column-resizer" onPointerDown={(event) => beginColumnResize(event, 'assignee', 80)} type="button" />
            </span>
            <span className="resizable-head">
              <span className="wbs-head-title"><span>開始日</span><HeaderDateFilter value={startDateFilter} onChange={setStartDateFilter} /></span>
              <button aria-label="開始日列を調整" className="column-resizer" onPointerDown={(event) => beginColumnResize(event, 'startDate', 80)} type="button" />
            </span>
            <span className="resizable-head">
              <span className="wbs-head-title"><span>完了日</span><HeaderDateFilter value={completedDateFilter} onChange={setCompletedDateFilter} /></span>
              <button aria-label="完了日列を調整" className="column-resizer" onPointerDown={(event) => beginColumnResize(event, 'completedDate', 80)} type="button" />
            </span>
            <span className="resizable-head">
              <span className="wbs-head-title"><span>見積/実績</span></span>
              <button aria-label="見積/実績列を調整" className="column-resizer" onPointerDown={(event) => beginColumnResize(event, 'hours', 80)} type="button" />
            </span>
          </div>
          {rows.map(({ node, depth, code }) => {
            const hours = getNodeHours(node);
            const rowProgress = getTaskCompletionProgress(node);
            const hasChildren = Boolean(node.children?.length);
            const canExpand = hasChildren && node.kind !== 'タスクチケット';
            const theme = getKindTheme(node);
            const KindIcon = theme.icon;
            return (
              <div
                className={`${selectedNode?.id === node.id ? `wbs-row selected theme-${theme.key}` : `wbs-row theme-${theme.key}`} ${node.isDraft ? 'is-draft' : ''}`}
                key={`${node.id}-${code}`}
                role="row"
                style={{ '--row-accent': theme.color, '--row-bg': theme.bg, gridTemplateColumns: tableTemplate }}
                onClick={() => {
                  if (!node.isDraft) openDetail(node);
                }}
              >
                <div className="wbs-code-cell">
                  {node.isDraft ? (
                    <button className="draft-complete-button" onClick={(event) => { event.stopPropagation(); commitDraftTicket(node.id); }} type="button">
                      完了
                    </button>
                  ) : node.displayNo ? (
                    <a
                      className="wbs-number"
                      href={getTaskScopeHash(node.displayNo)}
                      onClick={(event) => {
                        event.stopPropagation();
                        drillInto(node);
                      }}
                      title="このチケットをトップにして表示"
                    >
                      #{node.displayNo}
                    </a>
                  ) : (
                    <span className="wbs-number wbs-number--empty">-</span>
                  )}
                </div>
                <div><KindBadge node={node} /></div>
                <div><StatusProgressCell node={node} progress={rowProgress} /></div>
                <div><PriorityBadge priority={node.priority} /></div>
                <div className="wbs-name" style={{ '--depth': depth }}>
                  {canExpand ? (
                    <div className="tree-toggle-stack">
                      <button
                        className="tree-toggle"
                        onClick={(event) => { event.stopPropagation(); toggleExpanded(node.id); }}
                        title="配下を開閉"
                        type="button"
                      >
                        {expandedIds.has(node.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </div>
                  ) : (
                    <span className="tree-toggle-spacer" aria-hidden="true" />
                  )}
                  <span className="kind-icon" aria-hidden="true">
                    <KindIcon size={16} />
                  </span>
                  <div
                    className="wbs-title-stack"
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId((current) => (current === node.id ? null : current))}
                  >
                    {node.isDraft ? (
                      <>
                        <div className="draft-title-row">
                          <input
                            className="draft-title-input"
                            autoFocus
                            value={node.name}
                            onChange={(event) => updateDraftTicket(node.id, { name: event.target.value })}
                            placeholder="チケット名を入力"
                            onClick={(event) => event.stopPropagation()}
                          />
                          <button
                            className="draft-delete-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteDraftTicket(node.id);
                            }}
                            title="この下書きを削除"
                            type="button"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>
                        <span className="draft-row-note">空欄のままでも保存できます</span>
                      </>
                    ) : (
                      <button className="wbs-title-button" type="button">
                        <strong>{node.name}</strong>
                      </button>
                    )}
                    {!node.isDraft && canExpand && expandedIds.has(node.id) && hoveredNodeId === node.id ? (
                      <button
                        className="inline-create-trigger"
                        onClick={(event) => {
                          event.stopPropagation();
                          startInlineDraft(node);
                        }}
                        title="この下に子チケットを追加"
                        type="button"
                      >
                        <Plus size={11} aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="assignee-cell">{node.isDraft ? '-' : getAssigneeName(node)}</div>
                <div className="date-cell">{node.isDraft ? '-' : formatDateLabel(node.startDate)}</div>
                <div className="date-cell">{node.isDraft ? '-' : formatDateLabel(node.completedDate)}</div>
                <div className="hours-cell">{node.isDraft ? '- / -' : `${hours.planned || '-'}h / ${hours.actual}h`}</div>
              </div>
            );
          })}
        </div>
      </section>
      )}
    </section>
  );
}

function HeaderMultiFilter({ label, options, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);
  const filterRef = useRef(null);
  const allSelected = selectedIds.length === options.length;
  const selectedLabels = options.filter((option) => selectedIds.includes(option.id)).map((option) => option.label);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!filterRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  function toggleOption(optionId) {
    if (selectedIds.includes(optionId)) {
      onChange(selectedIds.filter((id) => id !== optionId));
      return;
    }
    onChange([...selectedIds, optionId]);
  }

  function stopHeaderEvent(event) {
    event.stopPropagation();
  }

  return (
    <div className="wbs-header-multi-filter" ref={filterRef} onClick={stopHeaderEvent}>
      <button
        aria-label={`${label}フィルター`}
        aria-expanded={open}
        className={allSelected ? 'wbs-filter-trigger' : 'wbs-filter-trigger active'}
        onClick={() => setOpen((current) => !current)}
        title={`${label}フィルター`}
        type="button"
      >
        <Filter size={13} aria-hidden="true" />
      </button>
      {open ? (
        <div className="wbs-header-filter-menu">
          <p className="wbs-header-filter-summary">
            {selectedLabels.length === options.length ? `${label}: すべて` : selectedLabels.length ? selectedLabels.join('、') : `${label}: 未選択`}
          </p>
          <div className="wbs-header-filter-actions">
            <button onClick={() => onChange(options.map((option) => option.id))} type="button">全選択</button>
            <button onClick={() => onChange([])} type="button">全選択解除</button>
          </div>
          <div className="wbs-header-filter-options" aria-label={`${label}フィルター`}>
            {options.map((option) => (
              <label key={option.id}>
                <input checked={selectedIds.includes(option.id)} onChange={() => toggleOption(option.id)} type="checkbox" />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HeaderDateFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const filterRef = useRef(null);
  const active = isDateFilterActive(value);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!filterRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  function changeMode(mode) {
    onChange({ ...value, mode });
  }

  function changeDate(date) {
    onChange({ ...value, date, mode: value.mode === 'none' ? 'after' : value.mode });
  }

  return (
    <div className="wbs-header-date-filter" ref={filterRef} onClick={(event) => event.stopPropagation()}>
      <button
        aria-label="日付フィルター"
        aria-expanded={open}
        className={active ? 'wbs-filter-trigger active' : 'wbs-filter-trigger'}
        onClick={() => setOpen((current) => !current)}
        title="日付フィルター"
        type="button"
      >
        <Filter size={13} aria-hidden="true" />
      </button>
      {open ? (
        <div className="wbs-header-filter-menu wbs-header-filter-menu--date">
          <label className="wbs-filter-field">
            <span>条件</span>
            <select value={value.mode} onChange={(event) => changeMode(event.target.value)}>
              <option value="none">指定なし</option>
              <option value="before">以前</option>
              <option value="after">以降</option>
            </select>
          </label>
          <label className="wbs-filter-field">
            <span>日付</span>
            <input
              disabled={value.mode === 'none'}
              value={value.date}
              onChange={(event) => changeDate(event.target.value)}
              type="date"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function HeaderTextFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const filterRef = useRef(null);
  const active = Boolean(value.trim());

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!filterRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  return (
    <div className="wbs-header-text-filter" ref={filterRef} onClick={(event) => event.stopPropagation()}>
      <button
        aria-label="チケット名検索"
        aria-expanded={open}
        className={active ? 'wbs-filter-trigger active' : 'wbs-filter-trigger'}
        onClick={() => setOpen((current) => !current)}
        title="チケット名検索"
        type="button"
      >
        <Filter size={13} aria-hidden="true" />
      </button>
      {open ? (
        <div className="wbs-header-filter-menu wbs-header-filter-menu--text">
          <label className="wbs-filter-field">
            <span>検索</span>
            <div className="wbs-filter-search">
              <Search size={14} aria-hidden="true" />
              <input
                autoFocus
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="チケット名・番号・リンク"
                type="search"
              />
            </div>
          </label>
          {active ? (
            <button className="wbs-filter-clear" onClick={() => onChange('')} type="button">
              クリア
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function collectPersonalTickets(nodes, currentUserId, kind) {
  const results = [];

  (function walk(items = []) {
    for (const node of items) {
      if (node.kind === kind && nodeMatchesUserRole(node, currentUserId)) {
        results.push({ node });
      }
      if (node.children?.length) walk(node.children);
    }
  })(nodes);

  return results;
}

function filterMyTaskHistory(items, historyMode) {
  if (historyMode === 'all') return items;
  return items.filter(({ node }) => {
    const status = normalizeStatus(node.status);
    return status !== 'done' && status !== 'discard';
  });
}

function nodeMatchesUserRole(node, currentUserId) {
  return getResponsibleMemberId(node) === currentUserId || getAssignedMemberId(node) === currentUserId;
}

function mergeLocalTickets(nodes, localTickets) {
  return nodes.map((node) => {
    const children = mergeLocalTickets(node.children || [], localTickets);
    const appended = localTickets.filter((ticket) => ticket.parentId === node.id).map((ticket) => ticket.node);
    return { ...node, children: children.length || appended.length ? [...children, ...appended] : node.children };
  });
}

function TicketDetailScreen({ node, tree, onBack, onDrill, onSelect }) {
  const theme = getKindTheme(node);
  return (
    <section
      className={`panel ticket-detail-screen theme-${theme.key}`}
      style={{ '--row-accent': theme.color, '--row-bg': theme.bg }}
    >
      <div className="ticket-detail-screen-head">
        <button className="scope-button" onClick={onBack} type="button">
          <ChevronLeft size={16} />
          WBSへ戻る
        </button>
        <div>
          <p className="eyebrow">Ticket detail</p>
          <h2>チケット詳細画面</h2>
        </div>
        <div className="ticket-detail-actions">
          <AiActionMenu
            items={aiMenus.ticket}
            helpTitle="チケット詳細のAI"
            helpBody="実際のサービスでは、このチケットの文脈をAIに渡して、AIへ作業を委任する、AIと一緒に作業する、説明や完了条件を自動で下書きする、といった操作を行います。"
          />
          {node?.children?.length ? (
            <button className="primary-button" onClick={() => onDrill(node)} type="button">
              この配下に絞る
            </button>
          ) : null}
        </div>
      </div>
      <NodeDetail node={node} tree={tree} onDrill={onDrill} onSelect={onSelect} />
    </section>
  );
}

function buildWbsRows(nodes, expandedIds, options, depth = 0, prefix = '') {
  return nodes.flatMap((node, index) => {
    const code = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
    const visibleByFilter = subtreeMatchesWbsOptions(node, options);
    if (!visibleByFilter) return [];
    const row = { node, depth, code };
    const hasActiveFilter = Boolean(options.searchTerm)
      || options.typeFilterIds.length !== options.typeFilterCount
      || options.statusFilterIds.length !== options.statusFilterCount
      || options.priorityFilterIds.length !== options.priorityFilterCount
      || options.assigneeFilterIds.length !== options.assigneeFilterCount
      || isDateFilterActive(options.startDateFilter)
      || isDateFilterActive(options.completedDateFilter);
    const shouldShowChildren = node.children?.length && (expandedIds.has(node.id) || hasActiveFilter);
    if (!shouldShowChildren) return [row];
    return [row, ...buildWbsRows(node.children, expandedIds, options, depth + 1, code)];
  });
}

function getExpandableNodeIds(nodes) {
  const ids = [];
  (function walk(items = []) {
    for (const node of items) {
      if (node.children?.length && node.kind !== 'タスクチケット') {
        ids.push(node.id);
        walk(node.children);
      }
    }
  })(nodes);
  return ids;
}

function subtreeHasType(node, type) {
  return node.type === type || Boolean(node.children?.some((child) => subtreeHasType(child, type)));
}

function subtreeHasText(node, text) {
  const query = text.trim().toLowerCase();
  if (!query) return true;
  const values = [node.name, node.kind, node.displayNo, node.status, node.owner, node.repository, node.issue, node.pr, node.slack, node.drive]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return values.includes(query) || Boolean(node.children?.some((child) => subtreeHasText(child, query)));
}

function subtreeMatchesWbsOptions(node, options) {
  return rowMatchesWbsOptions(node, options) || Boolean(node.children?.some((child) => subtreeMatchesWbsOptions(child, options)));
}

function rowMatchesWbsOptions(node, options) {
  if (!options.typeFilterIds.includes(node.kind)) return false;
  if (!options.statusFilterIds.includes(normalizeStatus(node.status))) return false;
  if (!options.priorityFilterIds.includes(normalizePriority(node.priority))) return false;
  if (!options.assigneeFilterIds.includes(getResponsibleMemberId(node))) return false;
  if (!matchesDateFilter(node.startDate, options.startDateFilter)) return false;
  if (!matchesDateFilter(node.completedDate, options.completedDateFilter)) return false;
  if (options.searchTerm && !subtreeHasText({ ...node, children: [] }, options.searchTerm)) return false;
  return true;
}

function isDateFilterActive(filter) {
  return Boolean(filter?.date && filter.mode !== 'none');
}

function matchesDateFilter(dateValue, filter) {
  if (!isDateFilterActive(filter)) return true;
  if (!dateValue) return false;
  if (filter.mode === 'before') return dateValue <= filter.date;
  if (filter.mode === 'after') return dateValue >= filter.date;
  return true;
}

function getMockWorkTree() {
  return mockApi.tasks.getWorkTree();
}

function getMockMembers() {
  return mockApi.master.getMembers();
}

function getNodeById(id, nodes = getMockWorkTree()) {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = getNodeById(id, node.children || []);
    if (child) return child;
  }
  return null;
}

function getNodeByDisplayNo(displayNo, nodes = getMockWorkTree()) {
  if (!displayNo) return null;
  for (const node of nodes) {
    if (node.displayNo === displayNo) return node;
    const child = getNodeByDisplayNo(displayNo, node.children || []);
    if (child) return child;
  }
  return null;
}

function findNodePath(id, nodes = getMockWorkTree(), path = []) {
  for (const node of nodes) {
    const nextPath = [...path, node];
    if (node.id === id) return nextPath;
    const childPath = findNodePath(id, node.children || [], nextPath);
    if (childPath.length) return childPath;
  }
  return [];
}

function getNodeHours(node) {
  const planned = Number(node?.plannedHours ?? node?.estimate ?? 0);
  const actual = Number(node?.completedHours ?? node?.actual ?? 0);
  if (planned || actual || !node?.children?.length) return { planned, actual };
  return node.children.reduce((sum, child) => {
    const childHours = getNodeHours(child);
    return { planned: sum.planned + childHours.planned, actual: sum.actual + childHours.actual };
  }, { planned: 0, actual: 0 });
}

function getTaskCompletionProgress(node) {
  if (!node || node.kind === 'タスクチケット') return null;
  const tasks = [];

  (function collect(items = []) {
    for (const item of items) {
      if (item.kind === 'タスクチケット') tasks.push(item);
      if (item.children?.length) collect(item.children);
    }
  })(node.children);

  if (!tasks.length) return null;
  const doneTasks = tasks.filter((task) => normalizeStatus(task.status) === 'done');
  const totalHours = tasks.reduce((sum, task) => sum + Number(task.estimate ?? task.plannedHours ?? 0), 0);
  const doneHours = doneTasks.reduce((sum, task) => sum + Number(task.estimate ?? task.plannedHours ?? 0), 0);
  const percent = totalHours > 0
    ? Math.round((doneHours / totalHours) * 100)
    : Math.round((doneTasks.length / tasks.length) * 100);

  return {
    done: doneTasks.length,
    total: tasks.length,
    doneHours,
    totalHours,
    percent
  };
}

function getMaxDisplayNoLength(nodes) {
  let max = 0;
  (function walk(items) {
    for (const node of items) {
      if (node.displayNo) max = Math.max(max, node.displayNo.length);
      if (node.children?.length) walk(node.children);
    }
  })(nodes);
  return max;
}

function formatDateLabel(dateString) {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${year}/${month}/${day}`;
}

function statusClass(status) {
  return normalizeStatus(status);
}

function normalizeStatus(status) {
  if (status === 'done' || status === '完了') return 'done';
  if (status === 'review' || status === 'レビュー中') return 'review';
  if (status === 'doing' || status === '進行中' || status === '設計中') return 'doing';
  if (status === 'discard' || status === '破棄') return 'discard';
  if (status === 'todo' || status === '未着手') return 'todo';
  return 'todo';
}

function getStatusLabel(status) {
  return statusOptions.find((option) => option.value === normalizeStatus(status))?.label || 'ToDo';
}

function getAssigneeName(node) {
  const members = getMockMembers();
  if (node?.assigneeId) return members.find((member) => member.id === node.assigneeId)?.name || '-';
  return node?.owner || '-';
}

function getResponsibleMemberId(node) {
  const members = getMockMembers();
  if (node?.assigneeId) return node.assigneeId;
  return members.find((member) => member.name === node?.owner)?.id || members[0]?.id || '';
}

function getRequesterMemberId(node) {
  const members = getMockMembers();
  if (node?.requesterId) return node.requesterId;
  if (node?.owner) return members.find((member) => member.name === node.owner)?.id || members[1]?.id || members[0]?.id || '';
  return members[1]?.id || members[0]?.id || '';
}

function getAssignedMemberId(node) {
  const members = getMockMembers();
  if (node?.assignedId) return node.assignedId;
  const normalized = normalizeStatus(node?.status);
  if (normalized === 'review') return members.find((member) => member.id !== getResponsibleMemberId(node))?.id || getResponsibleMemberId(node);
  return getResponsibleMemberId(node);
}

function buildMarkdownTemplate(value, node) {
  const fallbackValue = node?.kind === '成果物チケット' ? 'deliverable' : node?.kind === 'タスクチケット' ? 'task' : 'standard';
  const template = markdownTemplates.find((item) => item.value === (value || fallbackValue)) || markdownTemplates[0];
  return template.build(node);
}

function getRelatedSummary(node) {
  const values = [node?.repository, node?.issue, node?.pr, node?.slack, node?.drive].filter((value) => value && value !== '-');
  return values.length ? values.slice(0, 2).join(' / ') : '-';
}

function getKindTheme(node) {
  return kindThemes[node?.kind] || kindThemes.default;
}

function KindBadge({ node }) {
  const theme = getKindTheme(node);
  const Icon = theme.icon;
  return (
    <span className={`kind-chip theme-${theme.key}`} style={{ '--row-accent': theme.color, '--row-bg': theme.bg }}>
      <Icon size={13} />
      <span>{theme.label}</span>
    </span>
  );
}

function PriorityBadge({ priority }) {
  const normalized = normalizePriority(priority);
  return (
    <span className={`priority-badge priority-${normalized}`}>
      {getPriorityLabel(normalized)}
    </span>
  );
}

function StatusProgressCell({ node, progress }) {
  if (node?.isDraft) {
    return <span className="status-tag neutral">編集中</span>;
  }

  if (node?.kind === 'タスクチケット' || !progress) {
    return <span className={`status-tag ${statusClass(node?.status)}`}>{getStatusLabel(node?.status)}</span>;
  }

  return (
    <div className="status-progress-cell" aria-label={`配下タスク ${progress.done}/${progress.total}、見積時間ベース ${progress.percent}%`}>
      <span>{progress.done}/{progress.total}</span>
      <div className="progress-track progress-track--compact" aria-hidden="true">
        <span style={{ width: `${Math.min(100, progress.percent)}%` }} />
      </div>
      <b>{progress.percent}%</b>
    </div>
  );
}

function getDetailComments(node) {
  if (!node) return [];
  const kindLabel = getKindTheme(node).label;
  const base = [
    {
      id: `${node.id}-comment-1`,
      author: '山田太郎',
      role: 'PM',
      at: '2026/05/30 09:10',
      body: `${kindLabel}としての完了条件を先に揃えています。コメントで論点を残しておくと、あとから変更理由を追いやすいです。`
    },
    {
      id: `${node.id}-comment-2`,
      author: '佐藤花子',
      role: '運用',
      at: '2026/05/30 14:35',
      body: '関連リンクと成果物の紐づけを先に確認しました。後続のタスクが迷わない粒度にしてあります。'
    },
    {
      id: `${node.id}-comment-3`,
      author: '鈴木一郎',
      role: '実装',
      at: '2026/05/31 08:20',
      body: '一覧側の表示と詳細側の情報がぶれないように、変更履歴とコメントを同じ画面で追える形にしています。'
    }
  ];

  if (node.kind === 'タスクチケット') {
    return [
      {
        id: `${node.id}-comment-1`,
        author: '鈴木一郎',
        role: '実装',
        at: '2026/05/31 09:05',
        body: 'Issue と PR の対応関係をコメントに残しています。作業スレッドの追跡もここで可能です。'
      },
      {
        id: `${node.id}-comment-2`,
        author: '山田太郎',
        role: 'PM',
        at: '2026/05/31 10:40',
        body: '完了条件は成果物チケット側の定義に合わせています。差分が出たらここで補足します。'
      },
      {
        id: `${node.id}-comment-3`,
        author: 'あなた',
        role: 'レビュー',
        at: '2026/05/31 11:15',
        body: 'このタスクは空欄で作成しても、詳細であとから追記できるようにしておく。'
      }
    ];
  }

  if (node.kind === '成果物チケット') {
    return [
      {
        id: `${node.id}-comment-1`,
        author: '佐藤花子',
        role: '運用',
        at: '2026/05/30 13:20',
        body: '成果物の完成時点で、Repository か Drive のどちらを正とするかを明記してあります。'
      },
      {
        id: `${node.id}-comment-2`,
        author: '山田太郎',
        role: 'PM',
        at: '2026/05/30 15:10',
        body: '配下のタスクは成果物の完了条件に紐づくように整理しました。'
      },
      {
        id: `${node.id}-comment-3`,
        author: 'あなた',
        role: 'レビュー',
        at: '2026/05/31 08:50',
        body: 'コメント欄に議論の経緯を残して、変更履歴と合わせて追えるようにする。'
      }
    ];
  }

  return base;
}

function getChangeHistory(node) {
  if (!node) return [];
  const common = [
    {
      id: `${node.id}-history-1`,
      at: '2026/05/31 08:45',
      actor: '山田太郎',
      field: 'ステータス',
      before: '未着手',
      after: getStatusLabel(node.status)
    },
    {
      id: `${node.id}-history-2`,
      at: '2026/05/30 16:10',
      actor: '鈴木一郎',
      field: '担当者',
      before: '-',
      after: getAssigneeName(node)
    },
    {
      id: `${node.id}-history-3`,
      at: '2026/05/30 09:20',
      actor: '佐藤花子',
      field: '説明',
      before: '未記入',
      after: '経緯・完了条件を追記'
    }
  ];

  if (node.kind === 'タスクチケット') {
    return [
      {
        id: `${node.id}-history-1`,
        at: '2026/05/31 09:40',
        actor: '鈴木一郎',
        field: 'PR / Slack',
        before: '-',
        after: `${node.pr || '-'} ${node.slack || ''}`.trim()
      },
      ...common
    ];
  }

  if (node.kind === '成果物チケット') {
    return [
      {
        id: `${node.id}-history-1`,
        at: '2026/05/31 08:30',
        actor: '山田太郎',
        field: '完了条件',
        before: '未定義',
        after: '成果物と配下タスクの出口条件を固定'
      },
      ...common
    ];
  }

  return common;
}

function getWorkLogs(node) {
  if (!node) return [];
  return [
    { id: `${node.id}-worklog-1`, date: '2026-05-29', hours: 2 },
    { id: `${node.id}-worklog-2`, date: '2026-05-30', hours: 3.5 },
    { id: `${node.id}-worklog-3`, date: '2026-05-31', hours: 1.5 }
  ];
}

function NodeDetail({ node, tree, onDrill, onSelect }) {
  const detailMembers = useMemo(() => mockApi.master.getMembers(), []);
  const [leftTab, setLeftTab] = useState('basic');
  const [rightTab, setRightTab] = useState('discussion');
  const [commentDraft, setCommentDraft] = useState('');
  const [comments, setComments] = useState(() => getDetailComments(node));
  const [workLogs, setWorkLogs] = useState(() => getWorkLogs(node));
  const [isWorkLogOpen, setIsWorkLogOpen] = useState(false);
  const [workLogDraft, setWorkLogDraft] = useState({ date: '2026-05-31', hours: '1' });
  const [detailStatus, setDetailStatus] = useState(() => normalizeStatus(node?.status));
  const [detailPriority, setDetailPriority] = useState(() => normalizePriority(node?.priority));
  const [responsibleId, setResponsibleId] = useState(() => getResponsibleMemberId(node));
  const [requesterId, setRequesterId] = useState(() => getRequesterMemberId(node));
  const [assignedId, setAssignedId] = useState(() => getAssignedMemberId(node));
  const [descriptionTemplate, setDescriptionTemplate] = useState(() => (node?.kind === '成果物チケット' ? 'deliverable' : node?.kind === 'タスクチケット' ? 'task' : 'standard'));
  const [descriptionDraft, setDescriptionDraft] = useState(() => buildMarkdownTemplate(descriptionTemplate, node));
  const hours = getNodeHours(node);
  const taskProgress = getTaskCompletionProgress(node);
  const path = node?.id === 'all' ? ['全体WBS'] : findNodePath(node?.id, tree).map((item) => item.name);
  const theme = getKindTheme(node);
  const DetailIcon = theme.icon;

  useEffect(() => {
    setCommentDraft('');
    setComments(getDetailComments(node));
    setWorkLogs(getWorkLogs(node));
    setIsWorkLogOpen(false);
    setWorkLogDraft({ date: '2026-05-31', hours: '1' });
    setLeftTab('basic');
    setRightTab('discussion');
    setDetailStatus(normalizeStatus(node?.status));
    setDetailPriority(normalizePriority(node?.priority));
    setResponsibleId(getResponsibleMemberId(node));
    setRequesterId(getRequesterMemberId(node));
    setAssignedId(getAssignedMemberId(node));
    const nextTemplate = node?.kind === '成果物チケット' ? 'deliverable' : node?.kind === 'タスクチケット' ? 'task' : 'standard';
    setDescriptionTemplate(nextTemplate);
    setDescriptionDraft(buildMarkdownTemplate(nextTemplate, node));
  }, [node?.id]);

  const historyItems = useMemo(() => getChangeHistory(node), [node?.id]);
  const totalWorkLogHours = workLogs.reduce((sum, item) => sum + Number(item.hours || 0), 0);

  function addComment(event) {
    event.preventDefault();
    const text = commentDraft.trim();
    if (!text) return;
    setComments((current) => [
      ...current,
      {
        id: `comment-${node?.id}-${current.length + 1}`,
        author: 'あなた',
        role: 'レビュー',
        at: 'たった今',
        body: text
      }
    ]);
    setCommentDraft('');
  }

  function addWorkLog(event) {
    event.preventDefault();
    const hoursValue = Number(workLogDraft.hours);
    setWorkLogs((current) => [
      ...current,
      {
        id: `worklog-${node?.id}-${current.length + 1}`,
        date: workLogDraft.date || '2026-05-31',
        hours: Number.isFinite(hoursValue) ? hoursValue : 0
      }
    ]);
    setWorkLogDraft({ date: '2026-05-31', hours: '1' });
    setIsWorkLogOpen(false);
  }

  function changeResponsible(nextId) {
    setResponsibleId(nextId);
    if (assignedId === responsibleId || detailStatus !== 'review') {
      setAssignedId(nextId);
    }
  }

  function changeDetailStatus(nextStatus) {
    setDetailStatus(nextStatus);
    if (nextStatus === 'review' && assignedId === responsibleId) {
      setAssignedId(detailMembers.find((member) => member.id !== responsibleId)?.id || responsibleId);
    }
    if (nextStatus === 'doing' || nextStatus === 'todo') {
      setAssignedId(responsibleId);
    }
  }

  function changeDescriptionTemplate(nextTemplate) {
    setDescriptionTemplate(nextTemplate);
    setDescriptionDraft(buildMarkdownTemplate(nextTemplate, node));
  }

  return (
    <>
      <div className="detail-head">
        <div className="detail-title-group">
          <span className="detail-kind-icon" style={{ '--row-accent': theme.color, '--row-bg': theme.bg }}>
            <DetailIcon size={18} />
          </span>
          <div>
            <KindBadge node={node} />
            <h2>{node?.name}</h2>
            <p>{node?.displayNo ? `#${node.displayNo} / ` : ''}{path.join(' / ')}</p>
          </div>
        </div>
        <span className={`status-tag ${detailStatus}`}>{getStatusLabel(detailStatus)}</span>
      </div>
      <div className="detail-split-layout">
        <section className="detail-pane detail-pane--left">
          <div className="detail-tabs" role="tablist" aria-label="詳細情報">
            <button className={leftTab === 'basic' ? 'active' : ''} onClick={() => setLeftTab('basic')} type="button">基本情報</button>
            <button className={leftTab === 'description' ? 'active' : ''} onClick={() => setLeftTab('description')} type="button">説明</button>
          </div>
          <div className="detail-tab-body">
            {leftTab === 'basic' ? (
              <>
                <dl className="detail-field-table">
                  <div>
                    <dt>種別</dt>
                    <dd><KindBadge node={node} /></dd>
                  </div>
                  <div>
                    <dt>ステータス</dt>
                    <dd>
                      <select className="detail-field-control" value={detailStatus} onChange={(event) => changeDetailStatus(event.target.value)}>
                        {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </dd>
                  </div>
                  <div>
                    <dt>優先度</dt>
                    <dd>
                      <select className="detail-field-control" value={detailPriority} onChange={(event) => setDetailPriority(event.target.value)}>
                        {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </dd>
                  </div>
                  {node?.kind === 'タスクチケット' ? (
                    <div>
                      <dt>依頼人</dt>
                      <dd>
                        <select className="detail-field-control" value={requesterId} onChange={(event) => setRequesterId(event.target.value)}>
                          {detailMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                        </select>
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>
                      <span>担当者</span>
                      <HelpButton
                        title="担当者"
                        body="そのタスクを担当している人です。投下工数として計算される対象の人で、実際に作業した人を表します。"
                      />
                    </dt>
                    <dd>
                      <select className="detail-field-control" value={responsibleId} onChange={(event) => changeResponsible(event.target.value)}>
                        {detailMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                      </select>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <span>アサイン</span>
                      <HelpButton
                        title="アサイン"
                        body="現在このボールを持っている人です。レビュー待ちならレビューアー、修正依頼で戻す場合は作業者へ戻します。作業者がレビューを出す時は doing から review にして、アサインをレビューアーにします。"
                      />
                    </dt>
                    <dd>
                      <select className="detail-field-control" value={assignedId} onChange={(event) => setAssignedId(event.target.value)}>
                        {detailMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                      </select>
                    </dd>
                  </div>
                  <div>
                    <dt>見積 / 実績</dt>
                    <dd>{hours.planned || '-'}h / {hours.actual}h</dd>
                  </div>
                  {taskProgress ? (
                    <div>
                      <dt>進捗</dt>
                      <dd className="detail-progress-inline">
                        <span>{taskProgress.percent}%</span>
                        <div className="progress-track"><span style={{ width: `${taskProgress.percent}%` }} /></div>
                        <small>{taskProgress.done}/{taskProgress.total} tasks done</small>
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Repository</dt>
                    <dd>{node?.repository || '-'}</dd>
                  </div>
                  <div>
                    <dt>Drive / Link</dt>
                    <dd>{node?.drive || node?.issue || '-'}</dd>
                  </div>
                  <div>
                    <dt>PR / Slack</dt>
                    <dd>{`${node?.pr || '-'} ${node?.slack || ''}`}</dd>
                  </div>
                </dl>
                {node?.children?.length ? (
                  <div className="detail-subsection">
                    <div className="detail-subsection-head">
                      <h3>配下チケット</h3>
                      <button onClick={() => onDrill(node)} type="button">この配下に絞る</button>
                    </div>
                    <div className="child-ticket-list">
                      {node.children.map((child) => {
                        const childHours = getNodeHours(child);
                        const childTheme = getKindTheme(child);
                        const ChildIcon = childTheme.icon;
                        return (
                          <button
                            className={`theme-${childTheme.key}`}
                            key={child.id}
                            onClick={() => onSelect(child.id)}
                            style={{ '--row-accent': childTheme.color, '--row-bg': childTheme.bg }}
                            type="button"
                          >
                            <span className="child-ticket-kind"><ChildIcon size={13} />{childTheme.label}</span>
                            <strong>{child.name}</strong>
                            <small>{childHours.planned || '-'}h / {childHours.actual}h</small>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="detail-description-pane">
                <div className="detail-subsection-head">
                  <h3>説明</h3>
                  <span className="detail-section-badge">Markdown</span>
                </div>
                <label className="markdown-template-select">
                  <span>テンプレート</span>
                  <select className="detail-field-control" value={descriptionTemplate} onChange={(event) => changeDescriptionTemplate(event.target.value)}>
                    {markdownTemplates.map((template) => <option key={template.value} value={template.value}>{template.label}</option>)}
                  </select>
                </label>
                <textarea
                  className="markdown-description-input"
                  value={descriptionDraft}
                  onChange={(event) => setDescriptionDraft(event.target.value)}
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        </section>

        <aside className="detail-pane detail-pane--right">
          <div className="detail-tabs" role="tablist" aria-label="議論と履歴">
            <button className={rightTab === 'discussion' ? 'active' : ''} onClick={() => setRightTab('discussion')} type="button">ディスカッション</button>
            <button className={rightTab === 'history' ? 'active' : ''} onClick={() => setRightTab('history')} type="button">変更履歴</button>
            <button className={rightTab === 'worklog' ? 'active' : ''} onClick={() => setRightTab('worklog')} type="button">投下工数</button>
          </div>
          <div className="detail-tab-body detail-tab-body--activity" key={rightTab}>
            {rightTab === 'discussion' ? (
              <div className="chat-thread">
                <div className="comment-list">
                  {comments.map((comment) => (
                    <article className={comment.author === 'あなた' ? 'comment-item mine' : 'comment-item'} key={comment.id}>
                      <div className="comment-avatar">{comment.author.slice(0, 1)}</div>
                      <div className="comment-body">
                        <div className="comment-meta">
                          <strong>{comment.author}</strong>
                          <span>{comment.role} / {comment.at}</span>
                        </div>
                        <p>{comment.body}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <form className="comment-composer chat-composer" onSubmit={addComment}>
                  <textarea
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder="メッセージを入力"
                  />
                  <div className="comment-composer-row">
                    <span>URLや成果物の補足もここに残します</span>
                    <button className="primary-button" type="submit" title="送信">
                      <Send size={14} />
                      送信
                    </button>
                  </div>
                </form>
              </div>
            ) : rightTab === 'history' ? (
              <div className="history-timeline">
                {historyItems.map((item) => (
                  <article className="history-item" key={item.id}>
                    <div className="history-meta">
                      <strong>{item.field}</strong>
                      <span>{item.at} / {item.actor}</span>
                    </div>
                    <div className="history-diff">
                      <div>
                        <span>変更前</span>
                        <p>{item.before}</p>
                      </div>
                      <div>
                        <span>変更後</span>
                        <p>{item.after}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="worklog-pane">
                <div className="worklog-head">
                  <button className="icon-button" onClick={() => setIsWorkLogOpen(true)} title="投下工数を追加" type="button">
                    <Plus size={16} />
                  </button>
                </div>
                <table className="worklog-table">
                  <thead>
                    <tr>
                      <th>日付</th>
                      <th>投下時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workLogs.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDateLabel(item.date)}</td>
                        <td>{item.hours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="worklog-total">
                  <span>合計</span>
                  <strong>{totalWorkLogHours}h</strong>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
      {isWorkLogOpen ? (
        <div className="worklog-modal-backdrop" role="presentation" onMouseDown={() => setIsWorkLogOpen(false)}>
          <form className="worklog-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={addWorkLog}>
            <div className="worklog-modal-head">
              <h3>投下工数を追加</h3>
              <button onClick={() => setIsWorkLogOpen(false)} type="button">閉じる</button>
            </div>
            <label>
              <span>日付</span>
              <input
                value={workLogDraft.date}
                onChange={(event) => setWorkLogDraft((current) => ({ ...current, date: event.target.value }))}
                type="date"
              />
            </label>
            <label>
              <span>時間（h）</span>
              <input
                min="0"
                step="0.5"
                value={workLogDraft.hours}
                onChange={(event) => setWorkLogDraft((current) => ({ ...current, hours: event.target.value }))}
                type="number"
              />
            </label>
            <div className="worklog-modal-actions">
              <button onClick={() => setIsWorkLogOpen(false)} type="button">キャンセル</button>
              <button className="primary-button" type="submit">追加</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function getDetailNarrative(node) {
  if (!node) return '';
  if (node.kind === 'Projects') return 'Projects';
  if (node.kind === 'Project') return 'Project単位の箱です。配下にマイルストーンを持ち、Projectごとの工数、進捗、成果物、リポジトリを分けて管理します。';
  if (node.kind === '成果物チケット') return '成果物単位で完了条件を固定し、開発物はRepository、資料や調査はDriveと紐づけます。配下のタスクチケットがIssue、PR、Slack作業スレに分かれます。';
  if (node.kind === 'タスクチケット') return node.memo || '作業単位のチケットです。見積、実績、担当、作業スレ、Issue/PR/Driveを紐づけ、完了時にリソース実績へ反映します。';
  if (node.kind === 'マイルストーン') return 'マイルストーン配下の成果物とタスク総量を見て、現在のリソースで達成可能かを判断します。遅延や過剰見積は配下の成果物へ掘って確認します。';
  if (node.kind === 'カテゴリ' && node.type === 'Ad-hoc') return 'Ad-hocのカテゴリです。この下に成果物チケットを置き、成果物の下にタスクチケットを切ります。単発依頼でも作成物と作業を分けて管理します。';
  if (node.kind === 'カテゴリ') return 'Project外の仕事を分類する箱です。配下のチケットはリソース管理画面と同じ工数を持ちます。';
  return node.description || '上位階層の集計行です。配下へ掘ることで、どの成果物・タスクが工数や進捗に影響しているかを確認します。';
}

function getDefaultNewKind(parentNode) {
  if (parentNode?.kind === 'Projects') return 'Project';
  if (parentNode?.kind === 'Project') return 'マイルストーン';
  if (parentNode?.kind === 'マイルストーン') return '成果物チケット';
  if (parentNode?.kind === 'カテゴリ' && (parentNode?.type === 'Ad-hoc' || parentNode?.type === 'Explore')) return '成果物チケット';
  if (parentNode?.kind === '成果物チケット') return 'タスクチケット';
  return 'タスクチケット';
}

function getNextDisplayNo(tree, type) {
  const prefix = getDisplayPrefix(type);
  if (!prefix) return '';
  let max = 0;

  (function walk(nodes) {
    for (const node of nodes) {
      if (node.displayNo?.startsWith(`${prefix}-`)) {
        const value = Number(node.displayNo.split('-')[1]);
        if (!Number.isNaN(value)) {
          max = Math.max(max, value);
        }
      }
      if (node.children?.length) walk(node.children);
    }
  })(tree);

  return `${prefix}-${max + 1}`;
}

function getDisplayPrefix(type) {
  if (type === 'Project') return 'PRJ';
  if (type === 'Ad-hoc') return 'ADH';
  if (type === 'Explore') return 'EXP';
  return '';
}

function getTaskDetailHash(displayNo) {
  return `#/tasks/${encodeURIComponent(displayNo)}`;
}

function getTaskDetailNoFromHash(hash) {
  if (!hash) return null;
  const match = hash.match(/^#\/tasks\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getTaskScopeHash(displayNo) {
  return `#/tasks/scope/${encodeURIComponent(displayNo)}`;
}

function getTaskScopeNoFromHash(hash) {
  if (!hash) return null;
  const match = hash.match(/^#\/tasks\/scope\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getScopeAnchorNode(node, tree) {
  if (!node) return null;
  if (node.kind !== 'タスクチケット') return node;
  const path = findNodePath(node.id, tree);
  return path.at(-2) || node;
}
