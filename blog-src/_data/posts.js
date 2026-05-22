// ブログ記事の取得。2つのソースを統合する：
//  1) リポジトリ内の Markdown記事（articles/*.md）… 常設のSEOコラム
//  2) microCMS の記事（環境変数が設定されている場合）… 随時のお知らせ等
// 両者を公開日の新しい順にまとめて返す。
const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

const ARTICLES_DIR = path.join(__dirname, "..", "..", "articles");

function loadLocalPosts() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), "utf8");
      const { data, content } = matter(raw);
      const slug = data.slug || path.basename(f, ".md");
      return {
        id: slug,
        slug,
        title: data.title,
        description: data.description || "",
        category: data.category || "",
        publishedAt: data.publishedAt || data.date,
        updatedAt: data.updatedAt || data.publishedAt || data.date,
        eyecatch: data.eyecatch ? { url: data.eyecatch } : null,
        body: md.render(content),
      };
    });
}

async function loadMicroCmsPosts() {
  const SERVICE = process.env.MICROCMS_SERVICE_DOMAIN;
  const KEY = process.env.MICROCMS_API_KEY;
  if (!SERVICE || !KEY) {
    console.warn(
      "[posts] microCMSの環境変数が未設定のため、リポジトリ内の記事のみでビルドします。"
    );
    return [];
  }
  const url = `https://${SERVICE}.microcms.io/api/v1/blog?limit=100&orders=-publishedAt`;
  const res = await fetch(url, { headers: { "X-MICROCMS-API-KEY": KEY } });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`microCMS fetch failed: ${res.status} ${detail}`);
  }
  const data = await res.json();
  return data.contents || [];
}

module.exports = async function () {
  const [local, cms] = await Promise.all([
    Promise.resolve(loadLocalPosts()),
    loadMicroCmsPosts(),
  ]);
  const all = [...cms, ...local];
  all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  console.log(
    `[posts] 記事を読み込みました（リポジトリ:${local.length}件 / microCMS:${cms.length}件）`
  );
  return all;
};
