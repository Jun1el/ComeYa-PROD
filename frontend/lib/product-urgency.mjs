export function getProductUrgency(expiresAt, now = Date.now()) {
  const expiresAtMs = new Date(expiresAt).getTime();
  const remainingMs = expiresAtMs - now;
  const oneHourMs = 60 * 60 * 1000;

  if (!Number.isFinite(expiresAtMs) || remainingMs <= 0) {
    return { key: 'expired', label: 'Vencido', remainingMs };
  }

  if (remainingMs < oneHourMs) {
    return { key: 'urgent', label: 'Urgente', remainingMs };
  }

  if (remainingMs <= 3 * oneHourMs) {
    return { key: 'soon', label: 'Pronto', remainingMs };
  }

  return { key: 'available', label: 'Disponible', remainingMs };
}

export function formatRemainingTime(remainingMs) {
  const totalMinutes = Math.max(0, Math.ceil(remainingMs / 60000));
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}
