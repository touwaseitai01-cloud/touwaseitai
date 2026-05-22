// microCMS からブログ記事を取得する。
// 環境変数（MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY）が無い場合は
// サンプルデータを使うので、microCMS未接続でもローカルビルドが通る。
const sample = require("./sample-posts.json");

module.exports = async function () {
  const SERVICE = process.env.MICROCMS_SERVICE_DOMAIN;
  const KEY = process.env.MICROCMS_API_KEY;

  if (!SERVICE || !KEY) {
    console.warn(
      "[posts] microCMSの環境変数が未設定のため、サンプル記事でビルドします。"
    );
    return sample;
  }

  const url = `https://${SERVICE}.microcms.io/api/v1/blog?limit=100&orders=-publishedAt`;
  const res = await fetch(url, {
    headers: { "X-MICROCMS-API-KEY": KEY },
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`microCMS fetch failed: ${res.status} ${detail}`);
  }

  const data = await res.json();
  return data.contents || [];
};
