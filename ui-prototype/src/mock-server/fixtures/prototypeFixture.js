export const members = [
  { id: 'yamada', name: '山田太郎', role: 'PdM / Backend', team: '開発チーム', department: 'プロダクト部' },
  { id: 'sato', name: '佐藤花子', role: 'Operations', team: '運用チーム', department: '事業推進部' },
  { id: 'suzuki', name: '鈴木一郎', role: 'Frontend', team: '開発チーム', department: 'プロダクト部' },
  { id: 'tanaka', name: '田中次郎', role: 'AI Automation', team: '自動化チーム', department: 'プロダクト部' }
];

export const typeColors = {
  Project: '#2563eb',
  'Ad-hoc': '#0891b2',
  Explore: '#7c3aed',
  Reserved: '#64748b'
};

const displayNoPrefixes = {
  Project: 'PRJ',
  'Ad-hoc': 'ADH',
  Explore: 'EXP'
};

const baseWorkTree = [
  {
    id: 'project-root',
    kind: 'Projects',
    type: 'Project',
    name: 'Projects',
    description: 'Projects',
    children: [
      {
        id: 'project-beyond-r',
        kind: 'Project',
        type: 'Project',
        name: 'Beyond R MVP',
        owner: '山田太郎',
        repository: 'github.com/example/beyond-r',
        plannedHours: 168,
        completedHours: 82,
        children: [
          {
            id: 'ms-resource',
            kind: 'マイルストーン',
            type: 'Project',
            name: 'M1 リソース判断ができる',
            plannedHours: 92,
            completedHours: 45,
            children: [
              {
                id: 'deliverable-resource',
                kind: '成果物チケット',
                type: 'Project',
                name: 'リソース管理画面',
                status: '進行中',
                assigneeId: 'suzuki',
                assignedId: 'suzuki',
                repository: 'github.com/example/beyond-r',
                plannedHours: 72,
                completedHours: 34,
                children: [
                  { id: 'task-resource-range', kind: 'タスクチケット', type: 'Project', name: '日・週・月の表示切替', status: '進行中', priority: 'high', assigneeId: 'suzuki', estimate: 14, actual: 8, issue: '#128', pr: '#142', slack: '#delivery/1892' },
                  { id: 'task-reserved-placement', kind: 'タスクチケット', type: 'Project', name: 'Reserved固定配置', status: '未着手', priority: 'critical', assigneeId: 'yamada', estimate: 18, actual: 0, issue: '#131', pr: '-', slack: '#delivery/1901' },
                  { id: 'task-team-rollup', kind: 'タスクチケット', type: 'Project', name: '人・チーム集計ビュー', status: 'レビュー中', priority: 'medium', assigneeId: 'suzuki', estimate: 20, actual: 18, issue: '#119', pr: '#136', slack: '#delivery/1860' }
                ]
              },
              {
                id: 'deliverable-dashboard',
                kind: '成果物チケット',
                type: 'Project',
                name: 'バーンアップダッシュボード',
                status: '設計中',
                repository: 'github.com/example/beyond-r',
                plannedHours: 34,
                completedHours: 11,
                children: [
                  { id: 'task-burnup-lines', kind: 'タスクチケット', type: 'Project', name: '見積線・予定線・実績線の描画', status: '進行中', priority: 'high', assigneeId: 'yamada', estimate: 12, actual: 5, issue: '#151', pr: '-', slack: '#delivery/1930' },
                  { id: 'task-member-filter', kind: 'タスクチケット', type: 'Project', name: '対象者複数選択', status: '進行中', priority: 'medium', assigneeId: 'suzuki', estimate: 8, actual: 3, issue: '#152', pr: '-', slack: '#delivery/1931' }
                ]
              },
              {
                id: 'deliverable-resource-definition',
                kind: '成果物チケット',
                type: 'Project',
                name: 'リソース指標定義',
                status: '完了',
                assigneeId: 'suzuki',
                assignedId: 'suzuki',
                repository: 'github.com/example/beyond-r',
                plannedHours: 12,
                completedHours: 12,
                children: [
                  { id: 'task-resource-definition', kind: 'タスクチケット', type: 'Project', name: 'R/F/D指標定義', status: '完了', priority: 'medium', assigneeId: 'suzuki', estimate: 6, actual: 6, issue: '#118', pr: '#121', slack: '#delivery/1810' },
                  { id: 'task-capacity-rule', kind: 'タスクチケット', type: 'Project', name: '1日8時間の算出ルール整理', status: '完了', priority: 'medium', assigneeId: 'suzuki', estimate: 6, actual: 6, issue: '#120', pr: '#124', slack: '#delivery/1814' }
                ]
              }
            ]
          },
          {
            id: 'ms-task',
            kind: 'マイルストーン',
            type: 'Project',
            name: 'M2 タスク階層を運用できる',
            plannedHours: 76,
            completedHours: 37,
            children: [
              {
                id: 'deliverable-task',
                kind: '成果物チケット',
                type: 'Project',
                name: 'タスク管理画面',
                status: '進行中',
                assigneeId: 'suzuki',
                assignedId: 'suzuki',
                repository: 'github.com/example/beyond-r',
                plannedHours: 54,
                completedHours: 22,
                children: [
                  { id: 'task-wbs-drilldown', kind: 'タスクチケット', type: 'Project', name: 'WBSドリルダウン', status: '進行中', priority: 'critical', assigneeId: 'suzuki', estimate: 16, actual: 9, issue: '#140', pr: '-', slack: '#delivery/1910' },
                  { id: 'task-ticket-modal', kind: 'タスクチケット', type: 'Project', name: 'チケット登録モーダル', status: '未着手', priority: 'high', assigneeId: 'sato', estimate: 10, actual: 0, issue: '#143', pr: '-', slack: '#delivery/1918' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'project-portfolio-support',
        kind: 'Project',
        type: 'Project',
        name: '投資先支援ポータル',
        owner: '佐藤花子',
        repository: 'github.com/example/portfolio-support',
        plannedHours: 96,
        completedHours: 30,
        children: [
          {
            id: 'ms-portfolio-intake',
            kind: 'マイルストーン',
            type: 'Project',
            name: 'M1 依頼受付を一本化する',
            plannedHours: 54,
            completedHours: 20,
            children: [
              {
                id: 'deliverable-request-board',
                kind: '成果物チケット',
                type: 'Project',
                name: '依頼受付ボード',
                status: '進行中',
                repository: 'github.com/example/portfolio-support',
                plannedHours: 32,
                completedHours: 14,
                children: [
                  { id: 'task-request-form', kind: 'タスクチケット', type: 'Project', name: '依頼登録フォーム', status: '進行中', priority: 'high', assigneeId: 'sato', estimate: 10, actual: 5, issue: '#44', pr: '-', slack: '#portfolio/102' },
                  { id: 'task-routing-rule', kind: 'タスクチケット', type: 'Project', name: '担当者ルーティング', status: '未着手', priority: 'medium', assigneeId: 'tanaka', estimate: 8, actual: 0, issue: '#47', pr: '-', slack: '#portfolio/108' },
                  { id: 'task-notification-flow', kind: 'タスクチケット', type: 'Project', name: 'Slack通知フロー', status: 'レビュー中', priority: 'medium', assigneeId: 'tanaka', estimate: 6, actual: 6, issue: '#49', pr: '#52', slack: '#portfolio/111' }
                ]
              },
              {
                id: 'deliverable-drive-output',
                kind: '成果物チケット',
                type: 'Project',
                name: 'Drive成果物リンク管理',
                status: '設計中',
                assigneeId: 'suzuki',
                assignedId: 'suzuki',
                repository: 'github.com/example/portfolio-support',
                plannedHours: 22,
                completedHours: 6,
                children: [
                  { id: 'task-drive-picker', kind: 'タスクチケット', type: 'Project', name: 'Driveリンク入力UI', status: '進行中', priority: 'high', assigneeId: 'suzuki', estimate: 8, actual: 4, issue: '#58', pr: '-', slack: '#portfolio/120' },
                  { id: 'task-file-permission-note', kind: 'タスクチケット', type: 'Project', name: '共有権限メモ', status: '未着手', priority: 'low', assigneeId: 'sato', estimate: 5, actual: 0, issue: '#61', pr: '-', slack: '#portfolio/121' }
                ]
              }
            ]
          },
          {
            id: 'ms-portfolio-report',
            kind: 'マイルストーン',
            type: 'Project',
            name: 'M2 支援状況を報告できる',
            plannedHours: 42,
            completedHours: 10,
            children: [
              {
                id: 'deliverable-support-report',
                kind: '成果物チケット',
                type: 'Project',
                name: '支援状況レポート',
                status: '未着手',
                repository: 'github.com/example/portfolio-support',
                plannedHours: 28,
                completedHours: 6,
                children: [
                  { id: 'task-report-filter', kind: 'タスクチケット', type: 'Project', name: 'Project別フィルタ', status: '進行中', priority: 'medium', assigneeId: 'suzuki', estimate: 8, actual: 3, issue: '#70', pr: '-', slack: '#portfolio/133' },
                  { id: 'task-report-export', kind: 'タスクチケット', type: 'Project', name: '週次レポート出力', status: '未着手', priority: 'low', assigneeId: 'yamada', estimate: 10, actual: 0, issue: '#72', pr: '-', slack: '#portfolio/136' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'adhoc-root',
    kind: '管理区分',
    type: 'Ad-hoc',
    name: 'Ad-hoc',
    description: 'Projectに属さない単品の仕事。依頼や発生事象を起点に発生し、カテゴリー分けして管理する。',
    children: [
      {
        id: 'adhoc-client',
        kind: 'カテゴリ',
        type: 'Ad-hoc',
        name: '投資先支援',
        plannedHours: 48,
        completedHours: 21,
        children: [
          {
            id: 'adhoc-deliverable-sales-brief',
            kind: '成果物チケット',
            type: 'Ad-hoc',
            name: '投資先月次確認メモ',
            status: '進行中',
            plannedHours: 18,
            completedHours: 10,
            drive: 'drive.google.com/folder/monthly-brief',
            children: [
              { id: 'task-sales-check', kind: 'タスクチケット', type: 'Ad-hoc', name: '売上データ確認', status: '完了', priority: 'medium', assigneeId: 'sato', estimate: 6, actual: 7, drive: 'drive.google.com/file/sales-check', slack: '#adhoc/443' },
              { id: 'task-lp-summary', kind: 'タスクチケット', type: 'Ad-hoc', name: 'LP報告用サマリー作成', status: '進行中', priority: 'high', assigneeId: 'yamada', estimate: 8, actual: 3, drive: 'drive.google.com/file/lp-summary', slack: '#adhoc/448' }
            ]
          },
          {
            id: 'adhoc-deliverable-board-material',
            kind: '成果物チケット',
            type: 'Ad-hoc',
            name: '取締役会向け補足資料',
            status: '未着手',
            plannedHours: 12,
            completedHours: 2,
            drive: 'drive.google.com/file/board-material',
            children: [
              { id: 'task-board-risk-note', kind: 'タスクチケット', type: 'Ad-hoc', name: 'リスク論点メモ', status: '進行中', priority: 'critical', assigneeId: 'yamada', estimate: 5, actual: 2, drive: 'drive.google.com/file/risk-note', slack: '#adhoc/462' }
            ]
          }
        ]
      },
      {
        id: 'adhoc-inquiry',
        kind: 'カテゴリ',
        type: 'Ad-hoc',
        name: '問い合わせ対応',
        plannedHours: 18,
        completedHours: 9,
        children: [
          {
            id: 'adhoc-deliverable-inquiry-report',
            kind: '成果物チケット',
            type: 'Ad-hoc',
            name: '利用状況レポート修正版',
            status: '進行中',
            plannedHours: 9,
            completedHours: 4,
            drive: 'drive.google.com/file/report-fix',
            children: [
              { id: 'task-inquiry-report', kind: 'タスクチケット', type: 'Ad-hoc', name: '利用状況レポート修正', status: '進行中', priority: 'medium', assigneeId: 'sato', estimate: 5, actual: 2, drive: 'drive.google.com/file/report-fix', slack: '#adhoc/456' },
              { id: 'task-inquiry-confirmation', kind: 'タスクチケット', type: 'Ad-hoc', name: '依頼者への確認コメント', status: '未着手', priority: 'low', assigneeId: 'sato', estimate: 2, actual: 0, drive: 'drive.google.com/file/report-fix', slack: '#adhoc/457' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'explore-root',
    kind: '管理区分',
    type: 'Explore',
    name: 'Explore',
    description: '学習・探究・実験・挑戦。見積もりと実績を追跡し、将来の選択肢を増やす。',
    children: [
      {
        id: 'explore-ai',
        kind: 'カテゴリ',
        type: 'Explore',
        name: 'AI活用検証',
        plannedHours: 36,
        completedHours: 11,
        children: [
          {
            id: 'explore-deliverable-ai',
            kind: '成果物チケット',
            type: 'Explore',
            name: 'AI活用検証レポート',
            status: '進行中',
            plannedHours: 24,
            completedHours: 9,
            drive: 'drive.google.com/file/ai-report',
            children: [
              { id: 'task-ai-estimation', kind: 'タスクチケット', type: 'Explore', name: '過去Issueから見積もり抽出', status: '進行中', priority: 'high', assigneeId: 'tanaka', estimate: 10, actual: 5, drive: 'drive.google.com/file/issue-estimation', slack: '#explore/210' },
              { id: 'task-slack-thread', kind: 'タスクチケット', type: 'Explore', name: 'Slack作業スレ連携検証', status: '未着手', priority: 'medium', assigneeId: 'tanaka', estimate: 8, actual: 0, drive: 'drive.google.com/file/slack-thread-test', slack: '#explore/211' }
            ]
          }
        ]
      }
    ]
  }
];

export const workTree = assignWorkTreeMetadata(baseWorkTree);

export const resourceItems = [
  { id: 'r1', memberId: 'yamada', taskId: 'reserved-standup', date: '2026-06-01', start: 9, duration: 0.5, type: 'Reserved', label: '朝会', fixed: true },
  { id: 'r2', memberId: 'yamada', taskId: 'task-reserved-placement', date: '2026-06-01', start: 10, duration: 2, type: 'Project', label: 'Reserved固定配置', fixed: false, scheduled: true },
  { id: 'r3', memberId: 'yamada', taskId: 'task-lp-summary', date: '2026-06-01', start: 13, duration: 1.5, type: 'Ad-hoc', label: 'LP報告用サマリー作成', fixed: false },
  { id: 'r4', memberId: 'yamada', taskId: 'task-burnup-lines', date: '2026-06-01', start: 14.5, duration: 2.5, type: 'Project', label: '見積線・予定線・実績線の描画', fixed: false },
  { id: 'r5', memberId: 'sato', taskId: 'reserved-company', date: '2026-06-01', start: 9, duration: 1.5, type: 'Reserved', label: '全社会議', fixed: true },
  { id: 'r6', memberId: 'sato', taskId: 'task-inquiry-report', date: '2026-06-01', start: 10.5, duration: 2.5, type: 'Ad-hoc', label: '利用状況レポート修正', fixed: false, scheduled: true },
  { id: 'r7', memberId: 'sato', taskId: 'task-ticket-modal', date: '2026-06-01', start: 14, duration: 3, type: 'Project', label: 'チケット登録モーダル', fixed: false },
  { id: 'r8', memberId: 'suzuki', taskId: 'reserved-design-review', date: '2026-06-01', start: 9, duration: 1, type: 'Reserved', label: 'デザインレビュー', fixed: true },
  { id: 'r9', memberId: 'suzuki', taskId: 'task-wbs-drilldown', date: '2026-06-01', start: 10, duration: 4, type: 'Project', label: 'WBSドリルダウン', fixed: false, scheduled: true },
  { id: 'r10', memberId: 'suzuki', taskId: 'task-member-filter', date: '2026-06-01', start: 15, duration: 2, type: 'Project', label: '対象者複数選択', fixed: false },
  { id: 'r11', memberId: 'tanaka', taskId: 'task-ai-estimation', date: '2026-06-01', start: 9, duration: 2, type: 'Explore', label: '過去Issueから見積もり抽出', fixed: false, scheduled: true },
  { id: 'r12', memberId: 'tanaka', taskId: 'reserved-meeting', date: '2026-06-01', start: 13, duration: 2, type: 'Reserved', label: '移動・会議', fixed: true },
  { id: 'r13', memberId: 'tanaka', taskId: 'task-slack-thread', date: '2026-06-01', start: 15, duration: 2, type: 'Explore', label: 'Slack作業スレ連携検証', fixed: false },
  { id: 'r14', memberId: 'sato', taskId: 'task-request-form', date: '2026-06-02', start: 10, duration: 2, type: 'Project', label: '依頼登録フォーム', fixed: false, scheduled: true },
  { id: 'r15', memberId: 'tanaka', taskId: 'task-routing-rule', date: '2026-06-02', start: 13, duration: 2, type: 'Project', label: '担当者ルーティング', fixed: false },
  { id: 'r16', memberId: 'suzuki', taskId: 'task-drive-picker', date: '2026-06-02', start: 15, duration: 2, type: 'Project', label: 'Driveリンク入力UI', fixed: false },
  { id: 'r17', memberId: 'yamada', taskId: 'task-reserved-placement', date: '2026-06-02', start: 10, duration: 3, type: 'Project', label: 'Reserved固定配置', fixed: false, scheduled: true },
  { id: 'r18', memberId: 'yamada', taskId: 'task-reserved-placement', date: '2026-06-03', start: 9.5, duration: 2, type: 'Project', label: 'Reserved固定配置', fixed: false, scheduled: true },
  { id: 'r19', memberId: 'yamada', taskId: 'reserved-review', date: '2026-06-03', start: 13, duration: 1, type: 'Reserved', label: '週次レビュー', fixed: true }
];

export const burnupSeries = [
  { date: '6/1', weekday: '月', workingDay: true, total: 13, Project: 8, 'Ad-hoc': 3, Explore: 2 },
  { date: '6/2', weekday: '火', workingDay: true, total: 30, Project: 18, 'Ad-hoc': 7, Explore: 5 },
  { date: '6/3', weekday: '水', workingDay: true, total: 48, Project: 29, 'Ad-hoc': 12, Explore: 7 },
  { date: '6/4', weekday: '木', workingDay: true, total: 69, Project: 42, 'Ad-hoc': 18, Explore: 9 },
  { date: '6/5', weekday: '金', workingDay: true, total: 92, Project: 58, 'Ad-hoc': 23, Explore: 11 },
  { date: '6/6', weekday: '土', workingDay: false, total: 92, Project: 58, 'Ad-hoc': 23, Explore: 11 },
  { date: '6/7', weekday: '日', workingDay: false, total: 92, Project: 58, 'Ad-hoc': 23, Explore: 11 },
  { date: '6/8', weekday: '月', workingDay: true, total: 122, Project: 77, 'Ad-hoc': 31, Explore: 14 },
  { date: '6/9', weekday: '火', workingDay: true, total: 151, Project: 96, 'Ad-hoc': 37, Explore: 18 },
  { date: '6/10', weekday: '水', workingDay: true, total: 184, Project: 118, 'Ad-hoc': 44, Explore: 22 }
];

export const estimateTargets = {
  total: 348,
  Project: 264,
  'Ad-hoc': 48,
  Explore: 36
};

function assignDisplayNumbers(nodes) {
  const counters = { PRJ: 0, ADH: 0, EXP: 0 };

  function walk(items) {
    return items.map((node) => {
      const next = { ...node };
      const prefix = displayNoPrefixes[node.type];
      if (prefix && !node.id.endsWith('-root')) {
        counters[prefix] += 1;
        next.displayNo = `${prefix}-${counters[prefix]}`;
      }
      if (node.children?.length) {
        next.children = walk(node.children);
      }
      return next;
    });
  }

  return walk(nodes);
}

function assignWorkTreeMetadata(nodes) {
  const numbered = assignDisplayNumbers(nodes);
  let offset = 0;

  function walk(items) {
    return items.map((node) => {
      const startDate = shiftDate('2026-06-01', offset++);
      const next = {
        ...node,
        startDate,
        completedDate: node.status === '完了' ? shiftDate(startDate, 2) : node.completedDate
      };
      if (node.children?.length) {
        next.children = walk(node.children);
      }
      return next;
    });
  }

  return walk(numbered);
}

function shiftDate(baseDate, days) {
  const date = new Date(`${baseDate}T00:00:00+09:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
