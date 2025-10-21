// Load CSV (basic parser)
async function loadCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const rows = text.replace(/\r/g,'').split('\n').filter(Boolean).map(r => r.split(','));
  const header = rows[0];
  const data = rows.slice(1).map(r => Object.fromEntries(header.map((h,i) => [h, r[i] ?? ''])));
  return { header, data };
}

function toNum(v){
  const s = (v ?? '').toString().replace(/[, ]/g, '');
  const f = parseFloat(s);
  return isNaN(f) ? 0 : f;
}

function sum(arr){ return arr.reduce((a,b)=>a+b,0); }

function fmtNumber(n){ return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }
function fmtPct(n){ return (isFinite(n) ? n : 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) + '%'; }

function pick(header, candidates){
  for (const c of candidates){
    if (header.includes(c)) return c;
  }
  return null;
}

(async () => {
  const { header, data } = await loadCSV('../data/summary.csv');
  const c2025 = pick(header, ['YearBase_2025','2025_基準']) || header[0];
  const c2026 = pick(header, ['YearTarget_2026','2026_目標']) || header[0];
  const cStretch = pick(header, ['YearStretch_2026','2026_激勵']);
  const cGrowth = pick(header, ['Growth_2026_vs_2025_pct','成長率_2026_vs_2025基準%']);
  const cStretchGrowth = pick(header, ['Stretch_Uplift_vs_2026Target_pct','激勵增幅_相對2026目標%']);

  const total2025 = sum(data.map(d => toNum(d[c2025])));
  const total2026 = sum(data.map(d => toNum(d[c2026])));
  const growth = total2025 ? (total2026 / total2025 - 1) * 100 : 0;

  let totalStretch = 0, stretchUp = 0;
  if (cStretch){
    totalStretch = sum(data.map(d => toNum(d[cStretch])));
    stretchUp = total2026 ? (totalStretch / total2026 - 1) * 100 : 0;
  }

  document.getElementById('kpi-2025').textContent = fmtNumber(total2025);
  document.getElementById('kpi-2026').textContent = fmtNumber(total2026);
  document.getElementById('kpi-growth').textContent = fmtPct(growth);
  document.getElementById('kpi-stretch').textContent = fmtPct(stretchUp);

  // pick a display label
  const labelCandidates = ['Brand','品牌','Category','分類','名稱','品名','Item','項目','Owner','負責人'];
  const labelCol = pick(header, labelCandidates) || header[0];

  // Chart: Top 15 by 2026 target
  const sorted = [...data].sort((a,b) => toNum(b[c2026]) - toNum(a[c2026])).slice(0,15);
  const labels = sorted.map(d => d[labelCol] || '');
  const values = sorted.map(d => toNum(d[c2026]));

  const ctx = document.getElementById('bar').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: '2026 Target', data: values }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
  });
  document.getElementById('bar').parentElement.style.height = '400px';

  // Table (first 50 rows)
  const tableRows = data.slice(0,50);
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  header.forEach(h => { const th = document.createElement('th'); th.textContent = h; trh.appendChild(th); });
  thead.appendChild(trh); table.appendChild(thead);
  const tbody = document.createElement('tbody');
  tableRows.forEach(r => {
    const tr = document.createElement('tr');
    header.forEach(h => {
      const td = document.createElement('td');
      const val = r[h] ?? '';
      if ([cGrowth].includes(h) || [cStretchGrowth].includes(h)){
        const n = toNum(val); td.textContent = fmtPct(n); if (n < 0) td.classList.add('neg');
      } else if ([c2025,c2026,cStretch].includes(h)){
        td.textContent = fmtNumber(toNum(val));
      } else {
        td.textContent = val;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  document.getElementById('table').appendChild(table);
})();