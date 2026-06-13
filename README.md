# WorkHub

## 🌐 概要

WorkHub は、社内のデジタル化プロジェクトに関わるチケット、外部ツール、人間、AI、文脈を一元的に紐付けるためのHubです。  
このリポジトリでは、WorkHub のプロダクトコンセプト、チケット基本設計、UIプロトタイプを整理し、チケット管理Hubとしての方向性を検証します。

---

## 📚 ドキュメント構成

| パス | 内容 |
| --- | --- |
| [docs/product-concept/README.md](./docs/product-concept/README.md) | WorkHub の目的・思想・核となる考え方 |
| [docs/product-concept/concepts/](./docs/product-concept/concepts/) | チケット制、管理区分、リソース管理、見積もり基準などの個別コンセプト |
| [docs/basic-design/ticket-data-design.md](./docs/basic-design/ticket-data-design.md) | チケットが持つ情報、階層ルール、集約ルールの基本設計 |

---

## 🖥️ UIプロトタイプ

`ui-prototype/` は React による画面検証用のプロトタイプです。

DB、認証、外部API連携は実装せず、チケット管理、リソース管理、ダッシュボードの操作感を確認するためのものです。

| 画面 | 内容 |
| --- | --- |
| `マイタスク` | 自分が担当またはアサインされているチケットを確認 |
| `ダッシュボード` | 対象者・期間・管理区分を指定して、見積工数と投下工数の状況を確認 |
| `リソース管理` | Reserved 予定や作業可能量を踏まえて、チケットを受けられるかを判断 |
| `タスク管理` | [チケット制](./docs/product-concept/concepts/ticket-management-system.md)を採用し、仕事を細分化しながら WBS 表で確認できる |

---

## 🚀 起動手順

```bash
git clone <このリポジトリのURL>
cd ui-prototype
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

---

## 🌐 GitHub Pages

このプロトタイプは GitHub Pages でも公開しています。以下の URL から直接確認できます。

```text
https://ichiharahiroroki.github.io/workhub/
```

ローカルで確認したい場合は、上記の起動手順に従ってください。

---

## 🧪 ビルド確認

```bash
cd ui-prototype
npm run build
```

ビルド成果物は `ui-prototype/dist` に出力されます。
