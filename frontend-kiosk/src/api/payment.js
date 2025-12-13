import { request } from "./client.js";

/**
 * 결제 방법
 * @typedef {"kakaopay" | "tosspay"} PaymentMethod
 */

/**
 * 결제 준비 요청 데이터
 * @typedef {Object} PaymentData
 * @property {string} kid - 키오스크 ID
 * @property {string} pid - 제품 ID
 * @property {number} amount_grams - 무게 (gram)
 * @property {boolean} extra_bottle - 용기 추가 여부
 * @property {number} product_price - 제품 가격 (원/g)
 * @property {number} total_price - 총 가격
 * @property {PaymentMethod} payment_method - 결제 방법
 * @property {string} manager - 관리자 ID
 */

/**
 * 결제 준비 응답
 * @typedef {Object} PaymentPrepareResponse
 * @property {string} txid - 거래 ID
 * @property {string} qr_code_base64 - QR 코드 Base64 이미지
 */

/**
 * 결제 승인 요청 데이터
 * @typedef {Object} PaymentApprovalData
 * @property {string} txid - 거래 ID
 */

/**
 * 결제 승인 응답
 * @typedef {Object} PaymentApprovalResponse
 * @property {string} message - 응답 메시지
 */

/**
 * 결제 준비
 * @param {PaymentData} paymentData - 결제 정보
 * @returns {Promise<PaymentPrepareResponse>} 거래 ID 및 QR 코드
 */
export async function preparePayment(paymentData) {
  return request("/payments/", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
}

/**
 * 결제 승인
 * @param {PaymentApprovalData} approvalData - 승인 정보
 * @returns {Promise<PaymentApprovalResponse>} 승인 결과
 */
export async function approvePayment(approvalData) {
  return request("/payments/approve", {
    method: "POST",
    body: JSON.stringify(approvalData),
  });
}
