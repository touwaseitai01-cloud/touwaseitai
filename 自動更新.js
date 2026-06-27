/*
 * ✅ 自動デプロイ（変更検知 → 自動 commit → 自動 push）
 *
 * 起動の仕方：「自動更新を開始.bat」をダブルクリック
 *   ターミナルが開いたら、閉じずに置いておくだけ。
 *
 * 仕様：
 *   1. 起動時に一度 push を試みる（未送信のコミットがあればここで送られる）
 *   2. ファイル変更を検知すると 5秒後に自動で git add → commit → push
 *   3. commit するものが無くても、未送信の差分があれば push だけ走る
 *   4. push 失敗時はエラーをコンソールに表示（認証切れ等の早期発見）
 *   5. 重複検知をデバウンス、保存連打しても1回にまとめる
 *
 *   push 後は GitHub Actions が自動でビルド（Eleventy）し、
 *   GitHub Pages（touwaseitai.com）へ公開します。
 */
const { watch } = require('fs');
const { execSync } = require('child_process');

// 監視から除外（ビルド成果物・依存パッケージ・Git内部）
const IGNORE = ['.git', 'node_modules', '_site', '.cache'];
let timer;
let busy = false;

const ts = () => new Date().toLocaleTimeString();

function tryExec(cmd) {
  try {
    return { ok: true, out: execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }).trim() };
  } catch (e) {
    const stderr = (e.stderr && e.stderr.toString()) || e.message || '';
    return { ok: false, err: stderr.trim() };
  }
}

// 未送信のコミットがあるかだけ確認（ローカルキャッシュ参照、ネット不要）
function hasUnpushed() {
  const r = tryExec('git rev-list --count @{u}..HEAD');
  if (!r.ok) return false;
  const n = parseInt(r.out, 10);
  return Number.isFinite(n) && n > 0;
}

function pushOnly(reason) {
  if (!hasUnpushed()) return;
  const r = tryExec('git push');
  if (r.ok) {
    console.log(`🚀 ${ts()} — GitHubに自動プッシュしました（${reason}）→ まもなく touwaseitai.com に反映されます`);
  } else {
    console.error(`⚠️  ${ts()} — push に失敗しました（${reason}）`);
    if (r.err) console.error('     ' + r.err.split('\n').slice(0, 3).join('\n     '));
    console.error('     ※認証切れの可能性があります。「gh auth login」を試してください。');
  }
}

function runCycle(reason) {
  if (busy) return;
  busy = true;
  try {
    // 1) 変更があればまず commit を試みる
    tryExec('git add .');
    const c = tryExec('git commit -m "自動更新"');
    if (c.ok) {
      console.log(`📝 ${ts()} — 変更を自動コミットしました`);
    }
    // 2) 新しい commit の有無に関わらず、未送信があれば push
    pushOnly(reason);
  } finally {
    busy = false;
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ 東和盛泰サイト 自動デプロイを開始しました（Ctrl+C で停止）');
console.log('   ファイルを保存すると 5秒後に自動で GitHub へ送信します');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 起動直後：未送信コミットがあれば送る
runCycle('起動時チェック');

// 変更監視
watch('.', { recursive: true }, (_, filename) => {
  if (!filename) return;
  if (IGNORE.some(ig => filename.includes(ig))) return;
  clearTimeout(timer);
  timer = setTimeout(() => runCycle('変更検知'), 5000);
});
