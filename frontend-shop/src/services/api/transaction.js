import { request } from "./client";

export async function getTransactions(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.kioskId) queryParams.append("kiosk_id", params.kioskId);
  if (params.limit) queryParams.append("limit", params.limit);

  const query = queryParams.toString();
  return request(`/payments/transactions${query ? `?${query}` : ""}`);
}

export async function getTransactionById(transactionId) {
  return request(`/payments/transactions/${transactionId}`);
}
