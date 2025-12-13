import { request } from "./client.js";

/**
 * 키오스크 등록 요청 데이터
 * @typedef {Object} KioskRegistrationData
 * @property {string} name - 키오스크 이름
 * @property {string} location - 키오스크 위치
 */

/**
 * 키오스크 등록 응답
 * @typedef {Object} KioskRegistrationResponse
 * @property {string} kid - 키오스크 ID
 */

/**
 * 키오스크 정보
 * @typedef {Object} KioskInfo
 * @property {string} kid - 키오스크 ID
 * @property {string} name - 키오스크 이름
 * @property {string} location - 키오스크 위치
 * @property {string} status - 키오스크 상태
 * @property {Array<{pid: string, available: boolean}>} products - 제품 목록
 */

/**
 * 키오스크 제품 목록 응답
 * @typedef {Object} KioskProductsResponse
 * @property {Array<{product: Object, available: boolean}>} products - 제품 목록
 */

/**
 * API 응답 메시지
 * @typedef {Object} ApiMessageResponse
 * @property {string} message - 응답 메시지
 */

/**
 * 키오스크 등록
 * @param {KioskRegistrationData} kioskData - 키오스크 등록 정보
 * @returns {Promise<KioskRegistrationResponse>} 등록된 키오스크 ID
 */
export async function registerKiosk(kioskData) {
  return request("/kiosks/", {
    method: "POST",
    body: JSON.stringify(kioskData),
  });
}

/**
 * 키오스크 정보 조회 (제품 ID 목록 포함)
 * @param {string} kioskId - 키오스크 ID
 * @returns {Promise<KioskInfo>} 키오스크 정보
 */
export async function getKiosk(kioskId) {
  return request(`/kiosks/${kioskId}`);
}

/**
 * 키오스크의 제품 목록 조회
 * @param {string} kioskId - 키오스크 ID
 * @returns {Promise<KioskProductsResponse>} 키오스크 제품 목록
 */
export async function getKioskProducts(kioskId) {
  return request(`/kiosks/${kioskId}/products`);
}

/**
 * 키오스크에 제품 추가
 * @param {string} kioskId - 키오스크 ID
 * @param {string} productId - 제품 ID
 * @returns {Promise<ApiMessageResponse>} 성공 메시지
 */
export async function addProductToKiosk(kioskId, productId) {
  return request(`/kiosks/${kioskId}/products`, {
    method: "POST",
    body: JSON.stringify({ pid: productId }),
  });
}

/**
 * 키오스크에서 제품 제거
 * @param {string} kioskId - 키오스크 ID
 * @param {string} productId - 제품 ID
 * @returns {Promise<ApiMessageResponse>} 성공 메시지
 */
export async function deleteProductFromKiosk(kioskId, productId) {
  return request(`/kiosks/${kioskId}/products/${productId}`, {
    method: "DELETE",
  });
}
