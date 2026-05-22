# ブログ（microCMS連携）セットアップ手順

このサイトは「microCMSで記事を書く → GitHub Actionsが自動でHTML化 → GitHub Pagesに公開」という仕組みです。
編集者はmicroCMSの管理画面で記事を書くだけで、コード操作は不要です。

---

## 全体の流れ

```
[編集者] microCMS管理画面 ──公開ボタン──▶ [自動] GitHub Actions ──▶ [公開] touwaseitai.com/blog/
```

---

## 初回セットアップ（1回だけ）

### 1. microCMS アカウント・サービス作成（無料）

1. https://microcms.io にアクセスし、無料アカウントを作成
2. 「サービス」を1つ作成（サービスID＝URLの一部。例：`touwaseitai` → `touwaseitai.microcms.io`）

### 2. ブログAPI（コンテンツの入れ物）を作成

- API名：`ブログ`
- エンドポイント：**`blog`**（※この英字は必ず `blog` にする）
- 型：**リスト形式**

#### APIスキーマ（フィールド）を以下の通り作成

| フィールドID | 表示名 | 種類 | 必須 | 用途 |
|---|---|---|---|---|
| `title` | タイトル | テキストフィールド | ✓ | 記事タイトル |
| `slug` | URL用スラッグ | テキストフィールド | ✓ | URLの一部。半角英数字とハイフン（例：`knit-oem-merit`） |
| `description` | 説明文 | テキストフィールド | | 検索結果・SNSに出る要約（任意。未入力なら本文冒頭を自動使用） |
| `body` | 本文 | リッチエディタ | ✓ | 記事本文 |
| `eyecatch` | アイキャッチ画像 | 画像 | | 一覧・記事上部・SNS共有画像（任意） |
| `category` | カテゴリ | テキストフィールド | | 例：`お知らせ` / `コラム`（任意） |

> `publishedAt`（公開日時）はmicroCMSが自動で持つので作成不要です。

### 3. APIキーを取得

- microCMS管理画面 → サービス設定 → 「APIキー」 → デフォルトのキーをコピー

### 4. GitHubに「秘密情報（Secrets）」として登録

GitHubリポジトリ（touwaseitai01-cloud/touwaseitai）の
**Settings → Secrets and variables → Actions → New repository secret** で2つ登録：

| 名前 | 値 |
|---|---|
| `MICROCMS_SERVICE_DOMAIN` | サービスID（例：`touwaseitai`）※`.microcms.io`は不要 |
| `MICROCMS_API_KEY` | 手順3でコピーしたAPIキー |

> APIキーはここに入れればブラウザ（公開ページ）には一切出ないので安全です。

### 5. GitHub Pagesの公開方法を「GitHub Actions」に変更

リポジトリの **Settings → Pages → Build and deployment → Source** を
**「GitHub Actions」** に変更する。
（これで `_site`（ビルド結果）が公開されるようになります）

### 6. microCMS Webhook（記事公開で自動反映）

microCMS → ブログAPI → API設定 → Webhook → 「GitHub Actions」を追加：

- 対象イベント：コンテンツの公開・更新・削除
- 設定する内容（GitHub repository_dispatch）：
  - URL：`https://api.github.com/repos/touwaseitai01-cloud/touwaseitai/dispatches`
  - ヘッダー：
    - `Accept: application/vnd.github+json`
    - `Authorization: Bearer <GitHub Personal Access Token>`
  - ボディ：`{ "event_type": "microcms-update" }`

> GitHub Personal Access Token は、GitHubの Settings → Developer settings →
> Fine-grained tokens で、このリポジトリの「Contents: read」「Actions: write」権限で発行します。
> Webhookを設定しない場合でも、記事公開後にGitHubの「Actions」タブから手動で
> 「Run workflow」すれば反映できます。

---

## 日々の運用（記事を書くとき）

1. microCMS管理画面にログイン
2. ブログ → 「追加」→ タイトル・本文などを入力
3. **`slug`** に半角英数字でURL名を入れる（例：`autumn-knit-2026`）
4. 「公開」ボタンを押す
5. 約1〜2分後、`https://touwaseitai.com/blog/（slug）/` に自動公開される

---

## ローカルでの確認（開発者向け）

```bash
npm install      # 初回のみ
npm run build    # ビルド（_site に出力。microCMS未接続ならサンプル記事を使用）
npm run serve    # ローカルサーバーで確認
```

`MICROCMS_SERVICE_DOMAIN` / `MICROCMS_API_KEY` を環境変数に設定すると実データでビルドされます。
未設定時は `blog-src/_data/sample-posts.json` のサンプル記事でビルドされます。
