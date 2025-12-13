/**
 * @fileoverview localStorage 관리를 위한 공통 유틸리티
 */

const isDevelopment = import.meta.env.DEV;

/**
 * 통일된 로깅 함수
 * @param {string} module - 모듈 이름
 * @param {string} level - 로그 레벨 (info, warn, error)
 * @param {string} message - 로그 메시지
 * @param  {...any} args - 추가 인자
 */
export function log(module, level, message, ...args) {
  if (!isDevelopment) return;

  const emoji = {
    info: "💾",
    warn: "⚠️",
    error: "❌",
  };

  const prefix = `${emoji[level] || "💾"} [Storage:${module}]`;
  console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](prefix, message, ...args);
}

/**
 * localStorage에 데이터 저장
 * @param {string} key - 스토리지 키
 * @param {any} value - 저장할 값
 * @param {string} module - 모듈 이름 (로깅용)
 * @returns {boolean} 성공 여부
 */
export function setItem(key, value, module = "Unknown") {
  try {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    log(module, "error", `저장 실패 (${key}):`, error);
    return false;
  }
}

/**
 * localStorage에서 데이터 조회
 * @param {string} key - 스토리지 키
 * @param {string} module - 모듈 이름 (로깅용)
 * @param {boolean} parse - JSON 파싱 여부
 * @returns {any|null} 조회된 값 또는 null
 */
export function getItem(key, module = "Unknown", parse = true) {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return parse ? JSON.parse(data) : data;
  } catch (error) {
    log(module, "error", `조회 실패 (${key}):`, error);
    return null;
  }
}

/**
 * localStorage에서 데이터 삭제
 * @param {string} key - 스토리지 키
 * @param {string} module - 모듈 이름 (로깅용)
 * @returns {boolean} 성공 여부
 */
export function removeItem(key, module = "Unknown") {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    log(module, "error", `삭제 실패 (${key}):`, error);
    return false;
  }
}
