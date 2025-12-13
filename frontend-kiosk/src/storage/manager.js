/**
 * @fileoverview 관리자 정보 로컬 스토리지 관리
 * 관리자 정보를 localStorage에 저장/조회/삭제
 */

import { getItem, removeItem, setItem } from "./utils";

const STORAGE_KEY = "manager_info";
const MODULE_NAME = "Manager";

/**
 * 관리자 정보 매핑
 */
export const MANAGERS = {
  KIM: { code: "KIM", name: "김나현" },
  SOHN: { code: "SOHN", name: "손유진" },
  AHN: { code: "AHN", name: "안유경" },
  LEE: { code: "LEE", name: "이지현" },
  HWANG: { code: "HWANG", name: "황지현" },
};

/**
 * 관리자 정보를 localStorage에 저장
 *
 * @param {string} managerCode - 관리자 코드 (KIM, SOHN, AHN, LEE, HWANG)
 * @returns {boolean} 성공 여부
 */
export function saveManagerInfo(managerCode) {
  if (!MANAGERS[managerCode]) {
    console.warn(`💾 [Storage:Manager] 유효하지 않은 관리자 코드: ${managerCode}`);
    return false;
  }
  return setItem(STORAGE_KEY, managerCode, MODULE_NAME);
}

/**
 * localStorage에서 관리자 코드 조회
 *
 * @returns {string|null} 관리자 코드 또는 null
 */
export function getManagerCode() {
  return getItem(STORAGE_KEY, MODULE_NAME, false);
}

/**
 * localStorage에서 관리자 정보 조회
 *
 * @returns {Object|null} 관리자 정보 { code, name } 또는 null
 */
export function getManagerInfo() {
  const code = getManagerCode();
  return code ? MANAGERS[code] : null;
}

/**
 * localStorage에서 관리자 정보 삭제
 *
 * @returns {boolean} 성공 여부
 */
export function clearManagerInfo() {
  return removeItem(STORAGE_KEY, MODULE_NAME);
}
