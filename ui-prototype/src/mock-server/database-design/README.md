# Beyond R Mock Server Database Design

このディレクトリは、プロトタイプのモックサーバーが将来どのようなDBに置き換わるかを共有するためのテーブル設計メモです。
現時点の実装は `src/mock-server/mockApi.js` をAPI境界、`src/mock-server/fixtures/prototypeFixture.js` をモックデータ実体として扱います。

## 設計方針

- 画面はfixtureを直接読まず、必ず `mockApi` 経由でデータを取得する。
- WBSは `tickets` の自己参照で表現する。
- Project / Ad-hoc / Explore は `management_type` として扱う。
- マイルストーン、カテゴリ、成果物、タスクは `ticket_kind` として扱う。
- タスクは原則1人の担当者に紐づき、投下工数はその担当者の工数として集計する。
- `assignee_member_id` は現在ボールを持つ人、`responsible_member_id` は実作業と投下工数の対象者として分ける。
- Reserved予定はGoogle Calendar等の外部カレンダー由来の固定予定として扱う。
- 時間指定なしタスクは予定表には固定配置せず、見積残を空き枠へ積む対象として扱う。

## members

ユーザー、担当者、依頼人、アサイン対象を表します。

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | メンバーID。例: `yamada` |
| display_name | varchar |  | No | 表示名 |
| department_id | varchar | FK | Yes | 部門ID |
| team_id | varchar | FK | Yes | チームID |
| email | varchar |  | Yes | 通知・外部連携用メール |
| active | boolean |  | No | 表示・選択対象か |
| created_at | datetime |  | No | 作成日時 |
| updated_at | datetime |  | No | 更新日時 |

## departments

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | 部門ID |
| name | varchar |  | No | 部門名 |
| created_at | datetime |  | No | 作成日時 |
| updated_at | datetime |  | No | 更新日時 |

## teams

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | チームID |
| department_id | varchar | FK | Yes | 所属部門ID |
| name | varchar |  | No | チーム名 |
| created_at | datetime |  | No | 作成日時 |
| updated_at | datetime |  | No | 更新日時 |

## tickets

Project、マイルストーン、カテゴリ、成果物、タスクを同じテーブルで管理します。

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | 内部ID。プロトタイプでは表示IDと同じ扱いでもよい |
| display_no | varchar | Unique | No | 表示ID。例: `P-1`, `A-12`, `E-3` |
| parent_id | varchar | FK self | Yes | 親チケットID |
| management_type | enum |  | No | `Project`, `Ad-hoc`, `Explore` |
| ticket_kind | enum |  | No | `Projects`, `Project`, `マイルストーン`, `カテゴリ`, `成果物チケット`, `タスクチケット` |
| name | varchar |  | No | チケット名 |
| status | enum |  | No | `todo`, `doing`, `review`, `done`, `discard` |
| priority | enum |  | No | `critical`, `high`, `medium`, `low`。表示は `クリティカル`, `高`, `中`, `低` |
| description_md | text |  | Yes | Markdown形式の説明 |
| planned_hours | decimal |  | Yes | 成果物・マイルストーン用の計画工数 |
| estimate_hours | decimal |  | Yes | タスク用の見積時間 |
| actual_hours | decimal |  | Yes | 投下工数の集計値 |
| responsible_member_id | varchar | FK | Yes | 担当者。投下工数の対象 |
| assignee_member_id | varchar | FK | Yes | 現在ボールを持つ人 |
| requester_member_id | varchar | FK | Yes | 依頼人 |
| start_date | date |  | Yes | 開始日 |
| completed_date | date |  | Yes | 完了日 |
| due_date | date |  | Yes | 期限 |
| created_by | varchar | FK | Yes | 作成者 |
| created_at | datetime |  | No | 作成日時 |
| updated_at | datetime |  | No | 更新日時 |

## ticket_links

GitHub、Slack、Google Driveなどの関連リンクを一覧ではなく詳細画面で扱うためのテーブルです。

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | リンクID |
| ticket_id | varchar | FK | No | 紐づくチケットID |
| link_type | enum |  | No | `repository`, `issue`, `pull_request`, `slack_thread`, `drive`, `external` |
| label | varchar |  | Yes | 表示名 |
| url | text |  | No | URL |
| created_at | datetime |  | No | 作成日時 |
| updated_at | datetime |  | No | 更新日時 |

## resource_schedule_items

リソース管理画面に出す時間指定あり予定を表します。

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | 予定ID |
| member_id | varchar | FK | No | 対象メンバー |
| ticket_id | varchar | FK | Yes | 紐づくタスク。Reservedの場合はnull可 |
| schedule_type | enum |  | No | `Reserved`, `Project`, `Ad-hoc`, `Explore` |
| date | date |  | No | 日付 |
| start_time | time |  | No | 開始時刻 |
| duration_hours | decimal |  | No | 予定時間 |
| fixed | boolean |  | No | 固定配置か |
| scheduled | boolean |  | No | タスク側で時間指定された予定か |
| label | varchar |  | No | 表示名 |
| calendar_event_id | varchar | FK | Yes | 外部カレンダー予定ID |
| created_at | datetime |  | No | 作成日時 |
| updated_at | datetime |  | No | 更新日時 |

## calendar_events

Google Calendar等から取得するReserved予定の詳細です。

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | カレンダーイベントID |
| provider | varchar |  | No | 例: `google_calendar` |
| calendar_name | varchar |  | No | カレンダー名 |
| title | varchar |  | No | 予定名 |
| meeting_url | text |  | Yes | 会議リンク |
| location | varchar |  | Yes | 場所 |
| description | text |  | Yes | 説明 |
| starts_at | datetime |  | No | 開始日時 |
| ends_at | datetime |  | No | 終了日時 |
| created_at | datetime |  | No | 作成日時 |
| updated_at | datetime |  | No | 更新日時 |

## calendar_event_attendees

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | 参加者行ID |
| calendar_event_id | varchar | FK | No | カレンダーイベントID |
| member_id | varchar | FK | Yes | 社内メンバーの場合のID |
| display_name | varchar |  | No | 表示名 |
| email | varchar |  | Yes | メール |
| response_status | varchar |  | Yes | 参加回答 |

## work_logs

チケット詳細画面の投下工数タブで扱う、日付と投下時間だけの表です。

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | 投下工数ID |
| ticket_id | varchar | FK | No | 対象タスクチケット |
| member_id | varchar | FK | No | 担当者。タスクの担当者と一致する前提 |
| work_date | date |  | No | 投下日 |
| hours | decimal |  | No | 投下時間 |
| created_at | datetime |  | No | 作成日時 |
| updated_at | datetime |  | No | 更新日時 |

## ticket_comments

チケット詳細画面のディスカッションです。

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | コメントID |
| ticket_id | varchar | FK | No | 対象チケット |
| author_member_id | varchar | FK | No | 投稿者 |
| body | text |  | No | 本文 |
| created_at | datetime |  | No | 投稿日時 |
| updated_at | datetime |  | No | 更新日時 |
| deleted_at | datetime |  | Yes | 削除日時 |

## ticket_change_histories

チケット詳細画面の変更履歴です。変更前後の値を比較できることを優先します。

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | 履歴ID |
| ticket_id | varchar | FK | No | 対象チケット |
| actor_member_id | varchar | FK | No | 変更者 |
| field_name | varchar |  | No | 変更フィールド |
| before_value | text |  | Yes | 変更前 |
| after_value | text |  | Yes | 変更後 |
| changed_at | datetime |  | No | 変更日時 |

## burnup_daily_snapshots

ダッシュボードのバーンアップグラフ用スナップショットです。

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | スナップショットID |
| snapshot_date | date |  | No | 日付 |
| management_type | enum |  | No | `Project`, `Ad-hoc`, `Explore`, `total` |
| completed_hours | decimal |  | No | 完了工数 |
| working_day | boolean |  | No | 稼働日か |
| created_at | datetime |  | No | 作成日時 |

## estimate_targets

バーンアップの見積総量の基準値です。

| Column | Type | Key | Null | Description |
| --- | --- | --- | --- | --- |
| id | varchar | PK | No | 見積ターゲットID |
| management_type | enum |  | No | `Project`, `Ad-hoc`, `Explore`, `total` |
| target_hours | decimal |  | No | 見積総量 |
| valid_from | date |  | No | 適用開始日 |
| valid_to | date |  | Yes | 適用終了日 |

## 主なリレーション

| From | To | Relation |
| --- | --- | --- |
| tickets.parent_id | tickets.id | WBS階層 |
| tickets.responsible_member_id | members.id | 担当者 |
| tickets.assignee_member_id | members.id | 現在のアサイン |
| tickets.requester_member_id | members.id | 依頼人 |
| ticket_links.ticket_id | tickets.id | 関連リンク |
| resource_schedule_items.member_id | members.id | リソース表示対象 |
| resource_schedule_items.ticket_id | tickets.id | 時間指定タスク |
| resource_schedule_items.calendar_event_id | calendar_events.id | Reserved予定詳細 |
| work_logs.ticket_id | tickets.id | 投下工数 |
| ticket_comments.ticket_id | tickets.id | ディスカッション |
| ticket_change_histories.ticket_id | tickets.id | 変更履歴 |
