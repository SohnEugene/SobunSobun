export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:8000/api";

/**
 * HTTP 상태 코드 상수
 */
const HTTP_STATUS = {
  NO_CONTENT: 204,
};

/**
 * 기본 타임아웃 (밀리초)
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * 개발 환경 여부
 */
const isDevelopment = import.meta.env.MODE === "development";

/**
 * 통일된 로깅 함수
 * @param {string} level - 로그 레벨 (info, warn, error)
 * @param {string} message - 로그 메시지
 * @param {...any} args - 추가 인자
 */
function log(level, message, ...args) {
  if (!isDevelopment) return;
  const emoji = { info: "🌐", warn: "⚠️", error: "❌" };
  const prefix = `${emoji[level] || "🌐"} [API]`;
  console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
    prefix,
    message,
    ...args,
  );
}

/**
 * HTTP 요청 헬퍼 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} [options={}] - fetch 옵션 (method, body, headers, timeout 등)
 * @param {number} [options.timeout] - 요청 타임아웃 (밀리초)
 * @returns {Promise<Object>} - 서버에서 받은 JSON 데이터
 * @throws {Error} - HTTP 오류 또는 네트워크 오류
 */
export async function request(endpoint, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  log("info", `요청 시작: ${endpoint}`);

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  };

  // AbortController로 타임아웃 구현
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...config,
      signal: controller.signal,
    });

    if (response.ok) {
      // No Content 응답 처리
      if (
        response.status === HTTP_STATUS.NO_CONTENT ||
        response.headers.get("Content-Length") === "0"
      ) {
        log("info", `응답 성공 (No Content): ${endpoint}`);
        return {};
      }
      log("info", `응답 성공: ${endpoint}`);
      return await response.json();
    }

    // HTTP 에러 응답 처리
    const errorDetail = await parseErrorResponse(response);
    log("error", `HTTP 에러 (${response.status})`, endpoint, errorDetail);

    throw new Error(`HTTP ${response.status}: ${errorDetail}`);
  } catch (error) {
    // 네트워크 에러와 HTTP 에러 구분
    if (error.name === "TypeError") {
      log("error", "네트워크 연결 실패", endpoint);
      throw new Error(`네트워크 오류: ${endpoint} 연결 실패`);
    }
    if (error.name === "AbortError") {
      log("error", "요청 타임아웃", endpoint);
      throw new Error(`타임아웃: ${endpoint} 요청 시간 초과 (${timeout}ms)`);
    }
    log("error", "API 요청 실패", endpoint, error.message);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 에러 응답 파싱
 * @param {Response} response - Fetch API Response 객체
 * @returns {Promise<string>} - 파싱된 에러 메시지
 */
async function parseErrorResponse(response) {
  try {
    const errorData = await response.json();
    return errorData.detail || errorData.message || JSON.stringify(errorData);
  } catch (parseError) {
    log("warn", "응답 파싱 실패, 텍스트로 대체", parseError.message);
    try {
      return await response.text();
    } catch {
      return "알 수 없는 에러";
    }
  }
}
