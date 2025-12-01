/**
 * @fileoverview Bluetooth Low Energy (BLE) 장치 연결을 위한 React Hook
 * (Auto Reconnect 기능 추가됨)
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  saveBluetoothDevice,
  clearBluetoothDevice,
  getBluetoothDevice, // 저장된 ID 확인용
} from "../storage/bluetooth";

const SCALE_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const SCALE_CHAR_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";

export function useBluetooth({ saveToStorage = false } = {}) {
  const [weight, setWeight] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState(null);

  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const disconnectHandlerRef = useRef(null);
  const reconnectIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // ============================================================
  // 내부 함수: 데이터 파싱 (기존과 동일)
  // ============================================================
  const parseWeight = useCallback((value) => {
    const hexStr = Array.from(new Uint8Array(value.buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const middleHex = hexStr.slice(16, 28).replace(/^0+/, "");
    return middleHex ? parseInt(middleHex, 16) : 0;
  }, []);

  // ============================================================
  // 내부 함수: 공통 연결 로직 (GATT 연결 및 리스너 등록)
  // 핵심: 이 함수는 device 객체만 있으면 사용자 제스처 없이도 실행 가능
  // ============================================================
  const connectToDevice = useCallback(async (device, isReconnecting = false) => {
    try {
      console.log("🔗 [BLE] GATT 서버 연결 시도 중... 대상:", device.name || device.id);

      // 재연결 시: GATT가 이미 연결되어 있으면 먼저 끊기
      if (isReconnecting && device.gatt?.connected) {
        console.log("🔌 [BLE] 기존 GATT 연결 해제 후 재연결");
        try {
          device.gatt.disconnect();
          // 잠시 대기 (블루투스 스택이 정리되도록)
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (disconnectErr) {
          console.warn("⚠️ [BLE] 기존 연결 해제 실패 (무시):", disconnectErr.message);
        }
      }

      // 1. 이벤트 리스너 설정 (연결 해제 감지) - 재연결이 아닐 때만
      if (!isReconnecting) {
        const handleDisconnect = () => {
          console.log("⚠️ [BLE] 장치 연결이 끊어졌습니다");
          setIsConnected(false);
          setIsConnecting(false);
          setError("장치 연결이 끊어졌습니다. 재연결 시도 중...");
          characteristicRef.current = null;
          // deviceRef는 재연결을 위해 유지

          // 자동 재연결 시작 (3초마다 시도)
          if (!reconnectIntervalRef.current && deviceRef.current) {
            reconnectAttemptsRef.current = 0;
            reconnectIntervalRef.current = setInterval(async () => {
              if (!deviceRef.current) {
                console.log("ℹ️ [BLE] 재연결할 기기 정보가 없습니다");
                if (reconnectIntervalRef.current) {
                  clearInterval(reconnectIntervalRef.current);
                  reconnectIntervalRef.current = null;
                }
                return;
              }

              // 이미 연결되어 있으면 인터벌 정리하고 중단
              if (deviceRef.current.gatt?.connected) {
                console.log("ℹ️ [BLE] 이미 연결되어 있습니다");
                if (reconnectIntervalRef.current) {
                  clearInterval(reconnectIntervalRef.current);
                  reconnectIntervalRef.current = null;
                }
                return;
              }

              reconnectAttemptsRef.current += 1;
              console.log(`🔄 [BLE] 재연결 시도 중... (${reconnectAttemptsRef.current}번째)`);
              setIsConnecting(true);
              setError(`재연결 시도 중... (${reconnectAttemptsRef.current}번째)`);

              // 재연결 시도
              const success = await connectToDevice(deviceRef.current, true);

              // 성공하면 재연결 카운터 초기화 및 인터벌 정리
              if (success) {
                reconnectAttemptsRef.current = 0;
                if (reconnectIntervalRef.current) {
                  clearInterval(reconnectIntervalRef.current);
                  reconnectIntervalRef.current = null;
                }
              }
            }, 3000);
          }
        };

        // 기존 리스너가 있다면 제거 (중복 방지)
        if (disconnectHandlerRef.current && deviceRef.current) {
          deviceRef.current.removeEventListener("gattserverdisconnected", disconnectHandlerRef.current);
        }

        disconnectHandlerRef.current = handleDisconnect;
        device.addEventListener("gattserverdisconnected", handleDisconnect);
      }

      // 2. GATT 연결
      // 주의: 이미 연결된 상태라면 gatt.connect()는 기존 연결을 반환하거나 빠르게 성공함
      const server = await device.gatt.connect();
      console.log("✅ [BLE] GATT 서버 연결 성공");

      deviceRef.current = device;
      setDeviceName(device.name || "Unknown Device");

      // 3. 서비스 및 Characteristic 검색
      console.log("🔎 [BLE] 서비스 검색 중...");
      const service = await server.getPrimaryService(SCALE_SERVICE_UUID);
      
      console.log("🔎 [BLE] Characteristic 검색 중...");
      const characteristic = await service.getCharacteristic(SCALE_CHAR_UUID);
      characteristicRef.current = characteristic;

      // 4. Notification 시작
      if (!characteristic.properties.notify) {
        throw new Error("This device does not support notifications.");
      }

      const handleValue = (e) => {
        const newWeight = parseWeight(e.target.value);
        const adjustedWeight = Math.round(newWeight / 100);
        // console.log("📊 [BLE] 수신:", adjustedWeight); // 로그 너무 많으면 주석 처리
        setWeight(adjustedWeight);
      };

      await characteristic.startNotifications();
      characteristic.addEventListener("characteristicvaluechanged", handleValue);

      // 5. 연결 완료 상태 업데이트
      console.log("🎉 [BLE] 모든 연결 절차 완료!");
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);

      // (옵션) 저장소 업데이트
      if (saveToStorage) {
        saveBluetoothDevice({ id: device.id, name: device.name });
      }

      return true; // 성공

    } catch (err) {
      console.error("❌ [BLE] GATT 연결 실패:", err);
      setError(err.message || "Failed to connect to scale");
      setIsConnecting(false);

      // 실패 시 리소스 정리 (안전하게)
      try {
        if (device?.gatt?.connected) {
          device.gatt.disconnect();
        }
      } catch (disconnectErr) {
        console.warn("⚠️ [BLE] 연결 해제 중 에러 (무시됨):", disconnectErr);
      }

      return false; // 실패
    }
  }, [parseWeight, saveToStorage]);


  // ============================================================
  // 기능: 자동 재연결 시도 (컴포넌트 마운트 시 한 번만 실행)
  // ============================================================
  useEffect(() => {
    const tryAutoReconnect = async () => {
      // 브라우저 지원 확인
      if (!navigator.bluetooth) {
        console.log("ℹ️ [BLE] Web Bluetooth API 미지원");
        return;
      }

      // getDevices()가 지원되지 않는 경우 localStorage만으로 처리
      if (!navigator.bluetooth.getDevices) {
        console.log("⚠️ [BLE] getDevices() 미지원 - 자동 재연결 불가");
        console.log("💡 [BLE] Tip: Chrome 85+ 필요. Desktop의 경우 chrome://flags에서 활성화 필요");
        console.log("💡 [BLE] 또는 Fully Kiosk Browser 사용 권장");
        return;
      }

      try {
        console.log("🔄 [BLE] 자동 재연결 시도 중...");
        const devices = await navigator.bluetooth.getDevices();

        if (devices.length === 0) {
          console.log("ℹ️ [BLE] 이 사이트에 허용된 블루투스 기기가 없음.");
          return;
        }

        console.log(`📋 [BLE] 허용된 기기 목록 발견: ${devices.length}개`);

        // saveToStorage가 true면 저장된 기기 ID와 매칭, 아니면 첫 번째 기기 사용
        let targetDevice = null;

        if (saveToStorage) {
          const lastDevice = getBluetoothDevice();
          if (lastDevice) {
            targetDevice = devices.find(d => d.id === lastDevice.id);
            if (!targetDevice) {
              console.log("ℹ️ [BLE] 저장된 기기 ID와 일치하는 기기 없음");
              // 저장된 ID와 일치하지 않더라도 첫 번째 기기로 시도
              targetDevice = devices[0];
            }
          } else {
            console.log("ℹ️ [BLE] 저장된 기기 정보 없음. 첫 번째 허용된 기기로 연결 시도");
            // localStorage에 저장된 정보가 없어도 첫 번째 허용된 기기로 시도
            targetDevice = devices[0];
          }
        } else {
          // saveToStorage가 false면 첫 번째 허용된 기기로 연결 시도
          targetDevice = devices[0];
        }

        if (targetDevice) {
          console.log("🎯 [BLE] 재연결 대상 발견:", targetDevice.name || targetDevice.id);

          // deviceRef에 미리 저장 (연결 실패해도 나중에 재시도할 수 있도록)
          deviceRef.current = targetDevice;

          setIsConnecting(true);

          const success = await connectToDevice(targetDevice);

          if (!success) {
            // 연결 실패 시 (저울이 꺼져있거나 범위 밖) 주기적으로 재시도
            console.warn("⚠️ [BLE] 초기 연결 실패. 3초마다 재시도 시작");
            setIsConnecting(false);
            setError(`기기를 찾을 수 없습니다. 재시도 중...`);

            // 재연결 인터벌 시작 (기기가 범위 안으로 들어올 때까지)
            if (!reconnectIntervalRef.current) {
              reconnectAttemptsRef.current = 0;
              reconnectIntervalRef.current = setInterval(async () => {
                if (!deviceRef.current) {
                  if (reconnectIntervalRef.current) {
                    clearInterval(reconnectIntervalRef.current);
                    reconnectIntervalRef.current = null;
                  }
                  return;
                }

                if (deviceRef.current.gatt?.connected) {
                  if (reconnectIntervalRef.current) {
                    clearInterval(reconnectIntervalRef.current);
                    reconnectIntervalRef.current = null;
                  }
                  return;
                }

                reconnectAttemptsRef.current += 1;
                console.log(`🔄 [BLE] 재연결 시도 중... (${reconnectAttemptsRef.current}번째)`);

                // 10번 시도 후에는 중단하고 사용자에게 수동 연결 요청
                if (reconnectAttemptsRef.current > 10) {
                  console.log("⚠️ [BLE] 재연결 시도 10회 초과. 중단합니다.");
                  setIsConnecting(false);
                  setError("자동 연결 실패. '저울 연결하기' 버튼을 눌러주세요.");
                  if (reconnectIntervalRef.current) {
                    clearInterval(reconnectIntervalRef.current);
                    reconnectIntervalRef.current = null;
                  }
                  return;
                }

                setIsConnecting(true);
                setError(`재연결 시도 중... (${reconnectAttemptsRef.current}/10)`);

                const retrySuccess = await connectToDevice(deviceRef.current, true);

                if (retrySuccess) {
                  reconnectAttemptsRef.current = 0;
                  if (reconnectIntervalRef.current) {
                    clearInterval(reconnectIntervalRef.current);
                    reconnectIntervalRef.current = null;
                  }
                }
              }, 3000);
            }
          }
        }
      } catch (err) {
        console.warn("⚠️ [BLE] 자동 재연결 실패 (치명적이지 않음):", err);
        setIsConnecting(false);
      }
    };

    tryAutoReconnect();

    // cleanup: 언마운트 시 연결 해제 및 재연결 인터벌 정리
    return () => {
      // 재연결 인터벌 정리
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
        console.log("🛑 [BLE] 컴포넌트 언마운트로 인한 자동 재연결 중지");
      }

      // GATT 연결 해제
      if (deviceRef.current?.gatt?.connected) {
        console.log("👋 [BLE] 컴포넌트 언마운트로 인한 연결 해제");
        try {
          deviceRef.current.gatt.disconnect();
        } catch (err) {
          console.warn("⚠️ [BLE] 언마운트 시 연결 해제 실패:", err);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 한 번만 실행 (saveToStorage는 변경되지 않는다고 가정)


  // ============================================================
  // 외부 노출 함수: 최초 수동 연결 (기존 connect 수정)
  // ============================================================
  const connect = useCallback(async () => {
    console.log("🔵 [BLE] 새 기기 찾기 (수동 연결) 시작");
    setIsConnecting(true);
    setError(null);

    if (!navigator.bluetooth) {
      setError("Web Bluetooth를 지원하지 않는 브라우저입니다.");
      setIsConnecting(false);
      return;
    }

    try {
      const requestOptions = {
        filters: [{ services: [SCALE_SERVICE_UUID] }],
        optionalServices: [SCALE_SERVICE_UUID],
      };

      // 1. 사용자에게 기기 선택 요청 (팝업)
      const device = await navigator.bluetooth.requestDevice(requestOptions);
      console.log("✅ [BLE] 사용자가 기기를 선택함:", device.name);

      // 2. 선택된 기기로 연결 로직 수행
      await connectToDevice(device);

    } catch (err) {
      if (err.name === "NotFoundError" || err.message.includes("User cancelled")) {
        console.log("ℹ️ [BLE] 사용자 취소");
      } else {
        console.error("❌ [BLE] 수동 연결 중 에러:", err);
        setError(err.message);
      }
      setIsConnecting(false);
    }
  }, [connectToDevice]);

  // ============================================================
  // 외부 노출 함수: 연결 해제
  // ============================================================
  const disconnect = useCallback((clearStorage = false) => {
    console.log("🔌 [BLE] 연결 해제 시도...");

    // 재연결 인터벌 정리
    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current);
      reconnectIntervalRef.current = null;
      reconnectAttemptsRef.current = 0;
      console.log("🛑 [BLE] 자동 재연결 중지");
    }

    // 이벤트 리스너 제거
    if (deviceRef.current && disconnectHandlerRef.current) {
      try {
        deviceRef.current.removeEventListener("gattserverdisconnected", disconnectHandlerRef.current);
        disconnectHandlerRef.current = null;
      } catch (err) {
        console.warn("⚠️ [BLE] 이벤트 리스너 제거 실패:", err);
      }
    }

    // GATT 연결 해제
    if (deviceRef.current?.gatt?.connected) {
      try {
        deviceRef.current.gatt.disconnect();
        console.log("✅ [BLE] GATT 연결 해제 완료");
      } catch (err) {
        console.warn("⚠️ [BLE] GATT 연결 해제 실패:", err);
      }
    }

    // 스토리지 정리 (옵션)
    if (clearStorage && saveToStorage) {
      clearBluetoothDevice();
      console.log("🗑️ [BLE] 저장된 기기 정보 삭제");
    }

    // 상태 초기화
    deviceRef.current = null;
    characteristicRef.current = null;
    setIsConnected(false);
    setWeight(0);
    setDeviceName(null);
    setError(null);
  }, [saveToStorage]);

  const disconnectAndClear = useCallback(() => {
    disconnect(true);
  }, [disconnect]);

  return {
    weight,
    isConnected,
    isConnecting,
    error,
    deviceName,
    connect,
    disconnect,
    disconnectAndClear,
  };
}