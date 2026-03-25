export function isEmailOrPhone(value) {
  const v = (value || "").trim();
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phone = /^\+?[0-9\s-]{8,16}$/;
  return email.test(v) || phone.test(v);
}

export function minLen(value, n) {
  return (value || "").trim().length >= n;
}
