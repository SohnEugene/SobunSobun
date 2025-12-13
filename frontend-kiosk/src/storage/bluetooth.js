/**
 * @fileoverview 블루투스 저울 정보 로컬 스토리지 관리
 * 블루투스 저울 정보를 localStorage에 저장/조회/삭제
 */

import { getItem, removeItem, setItem } from "./utils";

const STORAGE_KEY = "bluetooth_device_info";
const MODULE_NAME = "Bluetooth";

/**
 * 블루투스 저울 정보를 localStorage에 저장
 *
 * @param {Object} deviceInfo - 블루투스 장치 정보
 * @param {string} deviceInfo.id - 장치 ID
 * @param {string} deviceInfo.name - 장치 이름
 * @returns {boolean} 성공 여부
 */
export function saveBluetoothDevice(deviceInfo) {
  if (!deviceInfo?.id) {
    console.warn("💾 [Storage:Bluetooth] 유효하지 않은 장치 정보");
    return false;
  }
  return setItem(STORAGE_KEY, deviceInfo, MODULE_NAME);
}

/**
 * localStorage에서 블루투스 저울 정보 조회
 *
 * @returns {Object|null} 블루투스 장치 정보 또는 null
 */
export function getBluetoothDevice() {
  return getItem(STORAGE_KEY, MODULE_NAME);
}

/**
 * localStorage에서 블루투스 저울 정보 삭제
 *
 * @returns {boolean} 성공 여부
 */
export function clearBluetoothDevice() {
  return removeItem(STORAGE_KEY, MODULE_NAME);
}
