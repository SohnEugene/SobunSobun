import { request } from "./client.js";

/**
 * 제품 정보 타입
 * @typedef {Object} Product
 * @property {string} pid - 제품 ID
 * @property {string} name - 제품 이름
 * @property {number} price - 제품 가격 (원/g)
 * @property {string} description - 제품 설명
 * @property {string} image_url - 제품 이미지 URL
 * @property {string[]} tags - 제품 태그
 * @property {number} original_price - 원래 가격
 * @property {number} original_gram - 원래 무게
 */

/**
 * 전체 제품 목록 조회
 * @returns {Promise<Product[]>} 제품 목록
 */
export async function getProducts() {
  return request("/products/");
}

/**
 * 특정 제품 상세 정보 조회
 * @param {string} productId - 제품 ID
 * @returns {Promise<Product>} 제품 정보
 */
export async function getProductById(productId) {
  return request(`/products/${productId}`);
}
