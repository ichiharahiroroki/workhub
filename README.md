# Beyond R UI Prototype

Beyond R は、VC社内のデジタル化を進めるうえで、まずエンジニアの業務を見える化し、限られたリソースの中で現実的に何を進められるかを判断するためのデモアプリです。

このリポジトリでは、DB・認証・外部API連携までは実装せず、React のプロトタイプとして「ダッシュボード」「リソース管理」「タスク管理」の操作感を確認できる状態にしています。

## 目的

- エンジニアのリソース、見積もり、完了工数を時間(h)ベースで見える化する
- Project / Ad-hoc / Explore / Reserved を分けて、どこに時間が使われているかを判断できるようにする
- 成果物、タスク、進捗、投下工数を一つの画面体系で追えるようにする
- GitHub Issue / PR、Slack 作業スレ、Notion、Google Drive、Calendar 連携のハブになる将来像を共有する
- デジタル化に向けたエンジニアタスクも、このツール上で成果物と作業単位に分けて管理する

詳しい思想と用語定義は [beyond-r-delivery-manage.md](./beyond-r-delivery-manage.md) を参照してください。

## 画面

- `マイタスク`: 自分が担当者またはアサインになっているタスク・成果物だけを確認する
- `ダッシュボード`: 対象者、期間、管理区分を指定し、見積総量に対して完了工数がどう積み上がっているかをバーンアップで確認する
- `リソース管理`: 1日8時間の稼働枠からReserved予定を差し引き、固定予定・時間指定タスク・未固定タスク量を見る
- `タスク管理`: Projects / Project / マイルストーン / 成果物 / タスクをWBS表で管理し、`#`クリックで表示スコープを掘り下げる

## 起動手順

```bash
git clone <このリポジトリのURL>
cd beyondR/ui-prototype
npm install
npm run dev
```

起動後、ターミナルに表示されるURLをブラウザーで開いてください。通常は以下です。

```text
http://localhost:5173/
```

別ポートで起動したい場合は、Vite の引数を指定します。

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

## ビルド確認

```bash
cd ui-prototype
npm run build
```

ビルド成果物は `ui-prototype/dist` に出力されます。

## データ

このプロトタイプのデータは、実DBではなくモックサーバー境界から取得します。

- `ui-prototype/src/mock-server/mockApi.js`: 画面が参照するモックAPI
- `ui-prototype/src/mock-server/fixtures/prototypeFixture.js`: サンプルデータ
- `ui-prototype/src/mock-server/database-design/README.md`: 将来DB化する場合のテーブル設計メモ

画面コンポーネントがfixtureを直接読むのではなく、`mockApi` 経由でデータを取得する方針にしています。

## 原典

`beyond-r-delivery-manage.md` は Beyond R の思想、用語、構造、運用ルールの原典です。このファイルはプロトタイプ実装の参照元であり、UI修正のために直接変更しません。
