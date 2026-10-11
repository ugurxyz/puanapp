// ---- Ortak yardımcılar (tüm sayfalar) ----
const ANAHTAR = { perf: 'gunlukPuanKayitlar', deneme: 'denemeKayitlari', ders: 'dersKonuKayitlari' };
const bellek = {}; // localStorage çalışmazsa oturum boyunca yedek

const $ = id => document.getElementById(id);

function clamp(v, min, max) {
  v = parseFloat(v);
  if (isNaN(v)) v = 0;
  return Math.min(max, Math.max(min, v));
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function oku(k) {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    if (v !== null) return v;
  } catch (e) { return bellek[k] || null; }
  return bellek[k] || null;
}
function yaz(k, v) {
  bellek[k] = v;
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
}
function kaldir(k) {
  delete bellek[k];
  try { localStorage.removeItem(k); } catch (e) {}
}
function diziOku(k) {
  const v = oku(k);
  return Array.isArray(v) ? v : [];
}

// performans kayıtları (eski tarih bazlı biçimi de listeye çevirir)
function perfOku() {
  const v = oku(ANAHTAR.perf);
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') {
    return Object.keys(v).sort().map(k => ({ sonuc: v[k].sonuc, soru: v[k].soru, saat: v[k].saat }));
  }
  return [];
}

function yeniId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function fmtSure(dk) {
  dk = Math.round(dk);
  const h = Math.floor(dk / 60), m = dk % 60;
  return h ? (m ? h + ' s ' + m + ' dk' : h + ' s') : m + ' dk';
}

function farkHtml(a, b, d) {
  if (a == null || b == null) return '';
  const x = a - b;
  if (Math.abs(x) < 0.05) return '<span class="dn">=</span>';
  return `<span class="${x > 0 ? 'up' : 'dw'}">${x > 0 ? '▲' : '▼'} ${Math.abs(x).toFixed(d == null ? 1 : d)}</span>`;
}

// alt menü
function navCiz(aktif) {
  const s = [
    ['index.html', '🏠', 'Ana', 'index'],
    ['page1.html', '📊', 'Performans', 'p1'],
    ['page2.html', '📝', 'Deneme', 'p2'],
    ['page3.html', '📚', 'Ders', 'p3']
  ];
  const el = document.createElement('nav');
  el.className = 'nav';
  el.innerHTML = '<div>' + s.map(x =>
    `<a href="${x[0]}" class="${x[3] === aktif ? 'on' : ''}"><b>${x[1]}</b>${x[2]}</a>`).join('') + '</div>';
  document.body.appendChild(el);
}

// çizgi grafik: vals = sayı dizisi
// seçenekler: max, adim (ızgara aralığı), etAdim (etiket aralığı), fmt
function cizgiGrafik(el, vals, o) {
  o = o || {};
  if (!vals.length) { el.innerHTML = '<div class="bos">Henüz kayıt yok</div>'; return; }
  const max = o.max || Math.max(1, ...vals);
  const adim = o.adim || max / 4, et = o.etAdim || adim;
  const fmt = o.fmt || (v => Number(v.toFixed(1)));
  const W = 400, H = 220, L = 34, R = 14, T = 16, B = 30;
  const iw = W - L - R, ih = H - T - B, n = vals.length;
  const x = i => L + (n === 1 ? iw / 2 : i * iw / (n - 1));
  const y = v => T + ih - (Math.max(0, Math.min(v, max)) / max) * ih;

  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  for (let v = 0; v <= max + 1e-9; v += adim) {
    const major = Math.abs(v / et - Math.round(v / et)) < 1e-6 || Math.abs(v - max) < 1e-6;
    s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#2a2e38" stroke-width="${major ? 1 : 0.5}"/>`;
    if (major) s += `<text x="${L - 6}" y="${y(v) + 4}" font-size="10" fill="#888" text-anchor="end">${fmt(v)}</text>`;
  }
  s += `<polyline points="${vals.map((v, i) => x(i) + ',' + y(v)).join(' ')}" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linejoin="round"/>`;
  const ax = Math.ceil(n / 7);
  vals.forEach((v, i) => {
    s += `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#3b82f6"/>`;
    s += `<text x="${x(i)}" y="${y(v) - 8}" font-size="10" fill="#e8e8e8" text-anchor="middle">${fmt(v)}</text>`;
    if (i % ax === 0 || i === n - 1) {
      s += `<text x="${x(i)}" y="${H - 10}" font-size="10" fill="#888" text-anchor="middle">${i + 1}</text>`;
    }
  });
  el.innerHTML = s + '</svg>';
}
