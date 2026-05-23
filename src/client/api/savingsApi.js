import api from "./axios";

const withIdempotency = (key) =>
  key ? { headers: { "Idempotency-Key": key } } : undefined;

export const getSavingsProducts = async () => {
  const res = await api.get("/api/savings/products");
  return res.data;
};

export const previewSavings = async (payload) => {
  const res = await api.post("/api/savings/preview", payload);
  return res.data;
};

export const initSavings = async (payload, idempotencyKey) => {
  const res = await api.post("/api/savings/init", payload, withIdempotency(idempotencyKey));
  return res.data;
};

export const confirmSavings = async (payload, idempotencyKey) => {
  const res = await api.post("/api/savings/confirm", payload, withIdempotency(idempotencyKey));
  return res.data;
};

export const getMySavingsAccounts = async (status) => {
  const params = status ? { status } : {};
  const res = await api.get("/api/savings/my-accounts", { params });
  return res.data;
};

export const getSavingsDetail = async (savingsId) => {
  const res = await api.get(`/api/savings/${savingsId}`);
  return res.data;
};

export const initEarlyWithdraw = async (savingsId, idempotencyKey) => {
  const res = await api.post(
    `/api/savings/${savingsId}/early-withdraw-init`,
    {},
    withIdempotency(idempotencyKey)
  );
  return res.data;
};

export const confirmEarlyWithdraw = async (savingsId, payload, idempotencyKey) => {
  const res = await api.post(
    `/api/savings/${savingsId}/early-withdraw-confirm`,
    payload,
    withIdempotency(idempotencyKey)
  );
  return res.data;
};
