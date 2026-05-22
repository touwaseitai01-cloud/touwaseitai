// Eleventy のビルド後に実行。
// 既存のトップページ・画像などの静的ファイルを _site/ にコピーして、
// ブログと合わせて1つの公開ディレクトリ(_site)にまとめる。
// ※ index.html は一切加工せず、そのままコピーするだけ。
import { cp, mkdir, access } from "node:fs/promises";

const OUT = "_site";

// _site にコピーする既存サイトのファイル/フォルダ
const ITEMS = ["index.html", "images", "CNAME", "robots.txt"];

await mkdir(OUT, { recursive: true });

for (const item of ITEMS) {
  try {
    await access(item);
  } catch {
    console.warn(`[assemble] ${item} が見つかりません。スキップします。`);
    continue;
  }
  await cp(item, `${OUT}/${item}`, { recursive: true });
  console.log(`[assemble] copied: ${item} -> ${OUT}/${item}`);
}

console.log("[assemble] 完了：トップページとブログを _site にまとめました。");
