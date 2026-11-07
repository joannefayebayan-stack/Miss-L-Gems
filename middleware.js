// Miss L Gems · access check
// Runs on Vercel before any page is sent.
// - A game page opens only after its own code (see access-settings.js).
// - Every other page needs the teacher code.
// - /teacher-codes shows the current code for every game (teacher only).
// Needs two Vercel environment variables: ACCESS_SECRET and TEACHER_CODE.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { GAMES } from './access-settings.js';
import { loadSaved, saveSaved } from './access-store.js';

export const config = { runtime: 'nodejs' };

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no O/0, I/1/L
const GRACE_MS = 4 * 60 * 60 * 1000;     // a student who got in keeps working for 4 hours, even if the code changes
const GAME_COOKIE_S = 12 * 60 * 60;      // game sign-in lasts at most 12 hours
const TEACHER_COOKIE_S = 14 * 24 * 60 * 60; // teacher sign-in lasts 14 days on that device
const TZ = '+07:00';                     // dates in access-settings.js are Thailand time

function hmac(secret, text) { return createHmac('sha256', secret).update(text).digest(); }
function hex(secret, text) { return hmac(secret, text).toString('hex').slice(0, 32); }
function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
function parseWhen(s) {
  const m = /^\s*(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})\s*$/.exec(String(s));
  if (!m) return NaN;
  return Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4].padStart(2, '0')}:${m[5]}:00${TZ}`);
}
export function changeTimes(game) {
  return (game.changes || []).map(parseWhen).filter(t => !Number.isNaN(t)).sort((a, b) => a - b);
}
export function windowOf(game, now) { return changeTimes(game).filter(t => t <= now).length; }
export function nextChange(game, now) { return changeTimes(game).find(t => t > now); }
export function codeFor(secret, id, w) {
  const h = hmac(secret, `code|${id}|${w}`);
  let out = '';
  for (let i = 0; i < 6; i++) out += ALPHABET[h[i] % ALPHABET.length];
  return out;
}
function clean(code) { return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 40); }

function cookies(req) {
  const out = {};
  for (const part of (req.headers.get('cookie') || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function setCookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}
function gameCookieOk(secret, id, game, value, now) {
  const [w, at, sig] = String(value || '').split('.');
  if (!sig || !same(sig, hex(secret, `game|${id}|${w}|${at}`))) return false;
  if (Number(w) === windowOf(game, now)) return true;
  return now - Number(at) < GRACE_MS;
}
function teacherCookieOk(secret, teacherCode, value) {
  const [at, sig] = String(value || '').split('.');
  return !!sig && same(sig, hex(secret, `teacher|${at}|${hex(secret, teacherCode)}`));
}

const STYLE = `*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f4ee;color:#2f3a4a;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;padding:16px}
main{width:100%;max-width:420px;background:#fffdf9;border:1px solid #e2ded4;border-radius:16px;padding:28px 24px}
h1{font:600 1.35rem/1.25 Georgia,serif;margin:0 0 6px}p{margin:0 0 16px;color:#5b6478}
label{display:block;font-weight:600;margin-bottom:6px}input{width:100%;font:600 1.4rem/1.2 ui-monospace,Menlo,monospace;letter-spacing:.18em;text-transform:uppercase;padding:12px;border:1px solid #c9c2b3;border-radius:10px;background:#fff}
button{margin-top:14px;width:100%;padding:12px;border:0;border-radius:10px;background:#2f6f6b;color:#fff;font:600 1rem system-ui,sans-serif;cursor:pointer}
.err{color:#9b3a1e;font-weight:600}table{width:100%;border-collapse:collapse;font-size:.95rem}td,th{text-align:left;padding:10px 8px;border-bottom:1px solid #e2ded4;vertical-align:top}
form.set{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}form.set input{font:400 1rem system-ui,sans-serif;letter-spacing:0;text-transform:none;padding:8px;width:auto;flex:1 1 180px}form.set button,form.row button{margin-top:0;width:auto;padding:8px 14px}form.row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}button.quiet{background:none;color:#2f6f6b;border:1px solid #c9c2b3}.ok{color:#1f4d40;font-weight:600}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
td a{overflow-wrap:anywhere}main{min-width:0}@media (max-width:700px){table,tbody,tr,td{display:block;width:100%}tr:first-child{display:none}tr{border-bottom:1px solid #e2ded4;padding:12px 0}td{border:0;padding:4px 0}}
code{font:700 1.1rem ui-monospace,Menlo,monospace;letter-spacing:.12em;color:#1f4d40}.wide{max-width:980px}small{color:#5b6478}a{color:#2f6f6b}`;
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function page(title, body, status = 200, extraHeaders = {}) {
  return new Response(`<!doctype html><html lang="en" translate="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="google" content="notranslate"><title>${esc(title)}</title><style>${STYLE}</style></head><body>${body}</body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', ...extraHeaders } });
}
function codeForm(title, intro, field, error, autocomplete = 'off') {
  return `<main><h1>${esc(title)}</h1><p>${esc(intro)}</p>${error ? `<p class="err" role="alert">${esc(error)}</p>` : ''}
<form method="post"><label for="c">Code</label><input id="c" name="${field}" autocomplete="${autocomplete}" autocapitalize="characters" spellcheck="false" required autofocus>
<button type="submit">Open</button></form></main>`;
}
const wait = ms => new Promise(r => setTimeout(r, ms));
function fmt(t) {
  return new Date(t).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// The dates in access-settings.js plus the dates saved on /teacher-codes.
async function currentGames(now) {
  let saved = {};
  try { saved = await loadSaved(now); } catch (e) { console.error('mlg: could not read saved dates', e && e.message); }
  const out = {};
  for (const [id, g] of Object.entries(GAMES)) out[id] = { ...g, changes: [...(g.changes || []), ...((saved && saved[id]) || [])] };
  return { games: out, saved: saved || {} };
}
function thaiStamp(t) {
  // "YYYY-MM-DD HH:MM" in Thailand time
  return new Date(t + 7 * 3600e3).toISOString().slice(0, 16).replace('T', ' ');
}

function findGame(games, pathname) {
  for (const [id, g] of Object.entries(games)) {
    if (pathname === g.page || pathname === g.page.replace(/\.html$/, '')) return [id, g];
  }
  return [null, null];
}

export default async function middleware(request) {
  const url = new URL(request.url);
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { path = url.pathname; }
  if (path.endsWith('/')) path += 'index.html';
  const secret = process.env.ACCESS_SECRET, teacherCode = process.env.TEACHER_CODE;
  if (!secret || secret.length < 16 || !teacherCode) {
    return page('Not ready', '<main><h1>This site is not ready yet</h1><p>Please try again later.</p></main>', 503);
  }
  const now = Date.now();
  const jar = cookies(request);
  const isTeacher = teacherCookieOk(secret, teacherCode, jar.mlg_t);
  const back = url.pathname + url.search;
  const { games, saved } = await currentGames(now);

  // Teacher sign-out
  if (path === '/teacher-signout') {
    return new Response(null, { status: 303, headers: { location: '/', 'set-cookie': setCookie('mlg_t', '', 0), 'cache-control': 'no-store' } });
  }

  // A game page: its own code (the teacher gets in too)
  const [id, game] = findGame(games, path);
  if (id) {
    if (isTeacher || gameCookieOk(secret, id, game, jar['mlg_g_' + id], now)) return; // let the page through
    let error = '';
    if (request.method === 'POST') {
      const form = await request.formData().catch(() => null);
      const typed = clean(form && form.get('code'));
      const w = windowOf(game, now);
      if (typed && same(typed, codeFor(secret, id, w))) {
        const value = `${w}.${now}.${hex(secret, `game|${id}|${w}|${now}`)}`;
        return new Response(null, { status: 303, headers: { location: back, 'set-cookie': setCookie('mlg_g_' + id, value, GAME_COOKIE_S), 'cache-control': 'no-store' } });
      }
      await wait(700);
      error = 'That code does not work. Check it with your teacher.';
    }
    return page(game.name, codeForm(game.name, 'Type the code your teacher gave you.', 'code', error), 401);
  }

  // Everything else: teacher only
  if (!isTeacher) {
    let error = '';
    if (request.method === 'POST') {
      const form = await request.formData().catch(() => null);
      const typed = String((form && form.get('teacher')) || '');
      if (typed && same(typed, teacherCode)) {
        const value = `${now}.${hex(secret, `teacher|${now}|${hex(secret, teacherCode)}`)}`;
        return new Response(null, { status: 303, headers: { location: back, 'set-cookie': setCookie('mlg_t', value, TEACHER_COOKIE_S), 'cache-control': 'no-store' } });
      }
      await wait(900);
      error = 'That code does not work.';
    }
    return page('Miss L Gems', codeForm('Miss L Gems', 'This page is for the teacher. Students: use the link and code your teacher gave you.', 'teacher', error, 'current-password').replace('autocapitalize="characters"', 'autocapitalize="off"').replace('<input id="c"', '<input id="c" type="password"'), 401);
  }

  // The teacher's code list, where she also sets when each code changes
  if (path === '/teacher-codes' || path === '/teacher-codes/index.html') {
    let note = '', noteErr = false;
    if (request.method === 'POST') {
      const form = await request.formData().catch(() => null);
      const gid = String((form && form.get('game')) || '');
      const action = String((form && form.get('action')) || '');
      if (GAMES[gid]) {
        const next = { ...saved };
        const kept = (next[gid] || []).filter(d => { const t = parseWhen(d); return !Number.isNaN(t) && t <= now; }); // past dates always stay
        if (action === 'set') {
          const t = parseWhen(String(form.get('when') || ''));
          if (Number.isNaN(t)) { note = 'Please choose a date and a time.'; noteErr = true; }
          else if (t <= now) { note = 'That time has already passed. Choose a future time, or use "New code now".'; noteErr = true; }
          else { next[gid] = [...kept, thaiStamp(t)]; }
        } else if (action === 'clear') { next[gid] = kept; }
        else if (action === 'now') { next[gid] = [...kept, thaiStamp(now - 60000)]; }
        if (!noteErr && ['set', 'clear', 'now'].includes(action)) {
          try {
            await saveSaved(next);
            return new Response(null, { status: 303, headers: { location: '/teacher-codes?saved=' + encodeURIComponent(gid) + '#' + encodeURIComponent(gid), 'cache-control': 'no-store' } });
          } catch (e) { console.error('mlg: save failed', e && e.message); note = 'Sorry, that could not be saved. Please try again.'; noteErr = true; }
        }
      }
    }
    const savedId = url.searchParams.get('saved');
    if (!note && savedId && GAMES[savedId]) note = 'Saved for ' + GAMES[savedId].name + '.';
    const view = noteErr ? games : (await currentGames(now)).games;
    const origin = url.origin;
    const rows = Object.entries(view).map(([gid, g]) => {
      const w = windowOf(g, now), nx = nextChange(g, now);
      const link = origin + g.page;
      const val = nx ? thaiStamp(nx).replace(' ', 'T') : '';
      return `<tr id="${esc(gid)}"><td><b>${esc(g.name)}</b><br><small><a href="${esc(link)}" target="_blank" rel="noopener">${esc(link)}</a></small></td><td><code>${codeFor(secret, gid, w)}</code></td>
<td>${nx ? '<b>' + esc(fmt(nx)) + '</b>' : '<small>No change date set</small>'}
<form method="post" class="set"><input type="hidden" name="game" value="${esc(gid)}"><label class="sr" for="w-${esc(gid)}">New code from</label><input id="w-${esc(gid)}" type="datetime-local" name="when" value="${val}" required>
<button name="action" value="set">Save</button></form>
<form method="post" class="row"><input type="hidden" name="game" value="${esc(gid)}">${nx ? '<button class="quiet" name="action" value="clear">Remove date</button>' : ''}<button class="quiet" name="action" value="now">New code now</button></form></td></tr>`;
    }).join('');
    return page('Game codes', `<main class="wide"><h1>Game codes</h1><p>Share a game's link and its code. Each code works only for its own game. To change a code, choose the date and time it should end, then Save. A new code appears here at that moment. Times are Thailand time. Shown ${esc(fmt(now))}.</p>
${note ? `<p class="${noteErr ? 'err' : 'ok'}" role="status">${esc(note)}</p>` : ''}
<table><tr><th>Game and link</th><th>Code now</th><th>When this code ends</th></tr>${rows}</table>
<p style="margin-top:18px"><small>A student who is already in keeps working for up to 4 hours after a code changes. "New code now" ends the current code straight away.</small></p>
<p><a href="/">Home</a> · <a href="/teacher-signout">Sign out on this device</a></p></main>`);
  }
  return; // teacher: let the page through
}
