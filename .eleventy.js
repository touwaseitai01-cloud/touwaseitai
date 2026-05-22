module.exports = function (eleventyConfig) {
  // ブログ用スタイルを /assets/ に配置
  eleventyConfig.addPassthroughCopy({ "blog-src/assets": "assets" });

  // 日付フィルタ（例: 2026年5月22日）
  eleventyConfig.addFilter("jpDate", (value) => {
    const d = new Date(value);
    if (isNaN(d)) return "";
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  });

  // ISO日付（sitemap等の lastmod 用: 2026-05-22）
  eleventyConfig.addFilter("isoDate", (value) => {
    const d = new Date(value);
    return isNaN(d) ? "" : d.toISOString().slice(0, 10);
  });

  // 本文の冒頭からプレーンテキストの抜粋を作る（descriptionが無い場合のフォールバック）
  eleventyConfig.addFilter("excerpt", (html, len = 110) => {
    if (!html) return "";
    const text = String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    return text.length > len ? text.slice(0, len) + "…" : text;
  });

  return {
    dir: {
      input: "blog-src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
  };
};
