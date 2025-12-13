/**
 * @fileoverview 키오스크 정보 로컬 스토리지 관리
 * 키오스크 등록 정보를 localStorage에 저장/조회/삭제
 */

import { getItem, removeItem, setItem } from "./utils";

const STORAGE_KEY = "kiosk_info";
const MODULE_NAME = "Kiosk";

/**
 * 키오스크 정보를 localStorage에 저장
 *
 * @param {Object} kioskInfo - 키오스크 정보
 * @param {string} kioskInfo.kid - 키오스크 ID
 * @param {string} kioskInfo.name - 키오스크 이름
 * @param {string} kioskInfo.location - 키오스크 위치
 * @returns {boolean} 성공 여부
 */
export function saveKioskInfo(kioskInfo) {
  if (!kioskInfo?.kid) {
    console.warn("💾 [Storage:Kiosk] 유효하지 않은 키오스크 정보");
    return false;
  }
  return setItem(STORAGE_KEY, kioskInfo, MODULE_NAME);
}

/**
 * localStorage에서 키오스크 정보 조회
 *
 * @returns {Object|null} 키오스크 정보 또는 null
 */
export function getKioskInfo() {
  return getItem(STORAGE_KEY, MODULE_NAME);
}

/**
 * localStorage에서 키오스크 정보 삭제
 *
 * @returns {boolean} 성공 여부
 */
export function clearKioskInfo() {
  return removeItem(STORAGE_KEY, MODULE_NAME);
}

/**
 * 키오스크 ID만 조회
 *
 * @returns {string|null} 키오스크 ID 또는 null
 */
export function getKioskId() {
  const info = getKioskInfo();
  return info?.kid || null;
}
