/**
 * @fileoverview 제품 정보 로컬 스토리지 캐싱 관리
 * 키오스크의 제품 목록을 localStorage에 캐싱하여 빠른 로딩 지원
 */

import { getItem, log, removeItem, setItem } from "./utils";

const STORAGE_KEY = "kiosk_products_cache";
const MODULE_NAME = "Products";

/**
 * 제품 정보를 localStorage에 저장
 *
 * @param {Array<Object>} products - 제품 목록
 * @returns {boolean} 성공 여부
 */
export function saveProductsCache(products) {
  if (!Array.isArray(products)) {
    log(MODULE_NAME, "warn", "유효하지 않은 제품 목록");
    return false;
  }

  const cacheData = {
    products,
    timestamp: Date.now(),
  };

  return setItem(STORAGE_KEY, cacheData, MODULE_NAME);
}

/**
 * localStorage에서 제품 정보 조회
 *
 * @param {Array<string>} pids - 조회할 제품 ID 목록
 * @returns {Array<Object>|null} 제품 목록 또는 null
 */
export function getProductsCache(pids) {
  if (!Array.isArray(pids) || pids.length === 0) {
    return null;
  }

  const cacheData = getItem(STORAGE_KEY, MODULE_NAME);
  if (!cacheData?.products) {
    return null;
  }

  const cachedProducts = cacheData.products;

  // 요청된 pid 목록과 캐시된 제품의 pid를 비교
  const cachedPids = new Set(cachedProducts.map((p) => p.pid));
  const requestedPids = new Set(pids);

  // 모든 요청된 pid가 캐시에 있는지 확인
  const allPidsInCache = [...requestedPids].every((pid) => cachedPids.has(pid));

  if (!allPidsInCache) {
    return null;
  }

  // 요청된 pid에 해당하는 제품만 필터링하여 반환
  return cachedProducts.filter((p) => requestedPids.has(p.pid));
}

/**
 * localStorage에서 제품 정보 삭제
 *
 * @returns {boolean} 성공 여부
 */
export function clearProductsCache() {
  return removeItem(STORAGE_KEY, MODULE_NAME);
}

/**
 * 단일 제품 정보를 캐시에 추가/업데이트
 *
 * @param {Object} product - 제품 정보
 * @returns {boolean} 성공 여부
 */
export function updateProductInCache(product) {
  if (!product?.pid) {
    log(MODULE_NAME, "warn", "유효하지 않은 제품 정보");
    return false;
  }

  let cacheData = getItem(STORAGE_KEY, MODULE_NAME);

  if (!cacheData) {
    cacheData = {
      products: [],
      timestamp: Date.now(),
    };
  }

  // 기존 제품 목록에서 같은 pid를 가진 제품 제거
  const filteredProducts = cacheData.products.filter(
    (p) => p.pid !== product.pid,
  );

  // 새 제품 추가
  filteredProducts.push(product);

  cacheData.products = filteredProducts;
  cacheData.timestamp = Date.now();

  return setItem(STORAGE_KEY, cacheData, MODULE_NAME);
}
