export function normalizarEnlace(url) {
  const enlace = String(url || '').trim()
  if (!enlace) return ''
  if (/^(https?:\/\/|mailto:|tel:|#|\/|\.)/i.test(enlace)) return enlace
  return `https://${enlace}`
}