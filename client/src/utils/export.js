// Simple CSV exporter
// columns: [{ key: 'name', header: 'Name' }, ...]
// rows: array of plain objects. Values will be stringified safely.
export function downloadCSV({ filename = 'export.csv', columns, rows }) {
  if (!columns || !Array.isArray(columns) || columns.length === 0) return;
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    // Escape quotes and wrap in quotes if necessary
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const header = columns.map(c => esc(c.header ?? c.key)).join(',');
  const body = rows.map(r => columns.map(c => esc(r[c.key])).join(',')).join('\n');
  const csv = header + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
