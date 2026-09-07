// Admin panel uchun oddiy parol himoyasi.
// Parol backend/.env faylidagi ADMIN_PASSWORD da saqlanadi.

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || 'admin123';
}

/** Admin uchun mo'ljallangan yo'llarni himoyalaydi */
export function requireAdmin(req, res, next) {
  const key = req.get('x-admin-key') || req.query.key;

  if (key && String(key) === adminPassword()) return next();

  res.status(401).json({ error: 'Parol noto\'g\'ri' });
}
