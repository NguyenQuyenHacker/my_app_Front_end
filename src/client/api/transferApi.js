import api from "./axios";

const withIdempotency = (key) =>
  key ? { headers: { "Idempotency-Key": key } } : undefined;

export const initInternalTransfer = async (payload, idempotencyKey) => {
  const res = await api.post(
    "/api/transfer/internal/init",
    payload,
    withIdempotency(idempotencyKey)
  );
  return res.data;
};

export const confirmInternalTransfer = async (payload, idempotencyKey) => {
  const res = await api.post(
    "/api/transfer/internal/confirm",
    payload,
    withIdempotency(idempotencyKey)
  );
  return res.data;
};

export const initExternalTransfer = async (payload, idempotencyKey) => {
  const res = await api.post(
    "/api/transfer/external/init",
    payload,
    withIdempotency(idempotencyKey)
  );
  return res.data;
};

export const confirmExternalTransfer = async (payload, idempotencyKey) => {
  const res = await api.post(
    "/api/transfer/external/confirm",
    payload,
    withIdempotency(idempotencyKey)
  );
  return res.data;
};
