# Beyond R UI Prototype

Beyond R は、社内のデジタル化と業務効率化を進めるためのタスク管理プロトタイプです。

主にエンジニアや社内のデジタル化・効率化プロジェクト参画者が対象で、AI と連携しながら業務の見える化やタスク管理の進め方を確認することを目的としています。

このリポジトリでは、DB・認証・外部API連携は実装せず、React を使った UI プロトタイプとして「ダッシュボード」「リソース管理」「タスク管理」の操作感を検証できる状態にしています。

## 達成したいこと

このレポジトリは、社内のデジタル化・業務効率化プロジェクトにおいて、タスク管理のあり方を検証し、方向性を固めるためのものです。

- 社内の効率化・デジタル化の進め方を確認する
- 社内のタスク管理ツールとしてのイメージを示す
- 設計思想や画面構成が会社の方針に合うかを判断する
- フィードバックを集めて、会社に合ったツールの設計を固める
- プロジェクト参画者の共通認識や議論の土台をつくる

詳しい思想や用語定義は [beyond-r-delivery-manage.md](./beyond-r-delivery-manage.md) をご参照ください。

## 画面

- `マイタスク`: 自分が担当またはアサインされているタスク・成果物のみを表示
- `ダッシュボード`: 対象者・期間・管理区分を指定して、見積総量に対する完了工数の積み上がりをバーンアップで確認
- `リソース管理`: 1日8時間の稼働枠から Reserved 予定を引き、固定予定・時間指定タスク・未固定タスク量を把握
- `タスク管理`: Projects / Project / マイルストーン / 成果物 / タスクを WBS 表で管理し、`#`クリックで表示スコープを広げる

## 起動手順

```bash
git clone <このリポジトリのURL>
cd beyondR/ui-prototype
npm install
npm run dev
```

起動後、ターミナルに表示される URL をブラウザーで開いてください。通常は以下です。

```text
http://localhost:5173/
```

別ポートで起動する場合:

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

## GitHub Pages

このプロトタイプは GitHub Pages でも公開しています。以下の URL から直接確認できます。

```text
https://ichiharahiroroki.github.io/beyond-R/
```

ローカルで確認したい場合は、上記の起動手順に従ってください。

## ビルド確認

```bash
cd ui-prototype
npm run build
```

ビルド成果物は `ui-prototype/dist` に出力されます。

## データ

このプロトタイプは実際のデータベースを使わず、モックサーバー経由でデータを取得する構成です。

- `ui-prototype/src/mock-server/mockApi.js`: 画面が参照するモック API
- `ui-prototype/src/mock-server/fixtures/prototypeFixture.js`: サンプルデータ
- `ui-prototype/src/mock-server/database-design/README.md`: 将来 DB 化する場合のテーブル設計メモ

画面コンポーネントは直接 fixture を参照せず、`mockApi` を通じてデータを取得する設計です。

## 原典

`beyond-r-delivery-manage.md` は Beyond R の思想、用語、構造、運用ルールの原典です。本ファイルは実装の参照元として扱い、UI 修正のために直接変更しません。
