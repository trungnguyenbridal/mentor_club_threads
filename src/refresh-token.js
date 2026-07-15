'use strict';
/*
 * refresh-token.js — Gia hạn TOKEN THREADS dài hạn (+60 ngày) rồi GHI NGƯỢC vào GitHub Secret.
 * Chạy trên GitHub Actions theo lịch (~2 lần/tháng) để token không bao giờ chết.
 *
 * Cần (đặt trong workflow):
 *   - env THREADS_ACCESS_TOKEN : token hiện tại (Secret). Threads yêu cầu token >24h tuổi & chưa hết hạn.
 *   - env GH_TOKEN             : PAT scope repo (Secret GH_PAT) — để ghi lại Secret.
 *   - env GITHUB_REPOSITORY    : Actions tự cấp dạng owner/repo.
 *
 * Cập nhật Secret bằng `gh secret set` (gh CLI có sẵn trên ubuntu-latest, tự mã hoá sealed-box).
 */
const { execFileSync } = require('child_process');
const GT = 'https://graph.threads.net/v1.0';

(async () => {
  const tok = process.env.THREADS_ACCESS_TOKEN || '';
  const repo = process.env.GITHUB_REPOSITORY || '';
  if (!tok) { console.error('Thiếu THREADS_ACCESS_TOKEN.'); process.exit(1); }

  const r = await fetch(`${GT}/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(tok)}`);
  const j = await r.json();
  if (!j.access_token) {
    console.error('Refresh lỗi (token có thể <24h tuổi hoặc đã hết hạn):', JSON.stringify(j));
    process.exit(2);
  }
  const newTok = j.access_token, days = Math.round((j.expires_in || 0) / 86400);
  console.log(`::add-mask::${newTok}`);       // che token trong log Actions
  console.log(`✔ Đã lấy token mới, còn ~${days} ngày.`);

  if (!process.env.GH_TOKEN) { console.error('Thiếu GH_TOKEN (Secret GH_PAT) — không ghi lại được Secret.'); process.exit(3); }
  if (!repo) { console.error('Thiếu GITHUB_REPOSITORY.'); process.exit(4); }

  // Ghi token mới vào Secret (value truyền qua stdin, không lộ trong argv/log).
  execFileSync('gh', ['secret', 'set', 'THREADS_ACCESS_TOKEN', '--repo', repo],
    { input: newTok, stdio: ['pipe', 'inherit', 'inherit'], env: process.env });
  console.log('✔ Đã cập nhật Secret THREADS_ACCESS_TOKEN (+60 ngày).');
})().catch(e => { console.error('FATAL', e.message || e); process.exit(1); });
