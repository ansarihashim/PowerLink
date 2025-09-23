export function pad(n) { return n < 10 ? `0${n}` : `${n}`; }

export function toYMD(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

export function fromYMD(s) {
  if (!s) return null;
  const [y, m, dd] = (s || "").split("-").map(Number);
  if (!y || !m || !dd) return null;
  return new Date(y, m - 1, dd);
}

export function formatDMY(input) {
  const d = input instanceof Date ? input : fromYMD(input);
  if (!d) return "";
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}

export function ymdToDMY(ymd) {
  return formatDMY(ymd);
}

export function dmyToYMD(dmy) {
  if (!dmy) return "";
  const parts = dmy.split("/").map((t) => t.trim());
  if (parts.length !== 3) return "";
  let [dd, mm, yyyy] = parts;
  if (!/^\d{1,2}$/.test(dd) || !/^\d{1,2}$/.test(mm) || !/^\d{4}$/.test(yyyy)) return "";
  const d = Number(dd), m = Number(mm), y = Number(yyyy);
  if (m < 1 || m > 12 || d < 1 || d > 31) return "";
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return "";
  return toYMD(date);
}

export function isValidDMY(s) {
  if (!s) return false;
  const ymd = dmyToYMD(s);
  return !!ymd;
}
