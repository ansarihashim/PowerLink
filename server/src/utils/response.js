export function ok(res, data = {}, status=200) {
  return res.status(status).json(data);
}
export function created(res, data = {}) {
  return res.status(201).json(data);
}
export function error(res, message='Error', code='ERROR', status=400, details) {
  return res.status(status).json({ error: { message, code, ...(details?{details}: {}) } });
}
