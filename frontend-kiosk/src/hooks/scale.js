import { useState, useRef, useCallback } from 'react';

// ✅ BLE UUID (소문자로 통일)
const SCALE_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb'; // Service
const SCALE_CHAR_UUID    = '0000fff1-0000-1000-8000-00805f9b34fb'; // Characteristic

/**
 * useScale Hook
 * - BLE 저울과 연결하여 실시간 무게 데이터를 수신하는 훅
 * - Web Bluetooth API 기반 (HTTPS 환경 + 사용자 제스처 필요)
 */
export function useScale() {
  const [weight, setWeight] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState(null);

  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // --------------------------------------------------
  // 🔌 1️⃣ 연결 해제 로직
  // --------------------------------------------------
  const disconnect = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (deviceRef.current?.gatt?.connected) {
      console.log('🔌 Disconnecting from device...');
      deviceRef.current.gatt.disconnect();
    }

    deviceRef.current = null;
    characteristicRef.current = null;
    setIsConnected(false);
    setWeight(0);
    setError(null);
    setDeviceName(null);
  }, []);

  // --------------------------------------------------
  // 🔗 2️⃣ BLE 연결 함수
  // --------------------------------------------------
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Android 호환성을 위한 설정 (acceptAllDevices + optionalServices)
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SCALE_SERVICE_UUID],
      });

      deviceRef.current = device;
      console.log('📱 Selected device:', { name: device.name, id: device.id });
      setDeviceName(device.name || 'Unknown Device');

      // 예기치 않은 연결 해제 시 처리
      device.addEventListener('gattserverdisconnected', (event) => {
        console.warn('⚠️ Device disconnected unexpectedly:', event.target);
        disconnect();
      });

      // GATT 서버 연결
      console.log('🔗 Connecting to GATT server...');
      const server = await device.gatt.connect();
      console.log('✅ Connected to GATT server');

      // 서비스 및 캐릭터리스틱 획득
      const service = await server.getPrimaryService(SCALE_SERVICE_UUID);
      console.log('📦 Got service:', service.uuid);

      const characteristic = await service.getCharacteristic(SCALE_CHAR_UUID);
      console.log('📨 Got characteristic:', characteristic.uuid);

      characteristicRef.current = characteristic;

      // 수신된 데이터 처리 핸들러
      const handleValue = (value) => {
        const newWeight = parseWeight(value);
        setWeight(newWeight);
      };

      // notify 우선, 없을 경우 read로 폴백
      if (characteristic.properties.notify) {
        console.log('🔔 Starting notifications...');
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (e) => {
          handleValue(e.target.value);
        });
      } else if (characteristic.properties.read) {
        console.log('⏱ Polling characteristic value...');
        pollIntervalRef.current = setInterval(async () => {
          try {
            const value = await characteristic.readValue();
            handleValue(value);
          } catch (err) {
            console.error('Error reading value:', err);
          }
        }, 500);
      } else {
        throw new Error('Characteristic does not support read or notify');
      }

      setIsConnected(true);
      setIsConnecting(false);
      console.log('🎉 BLE connected successfully');
    } catch (err) {
      console.error('❌ Connection error:', err);
      setError(err.message || 'Failed to connect to scale');
      setIsConnecting(false);
      disconnect();
    }
  }, [disconnect]);

  // --------------------------------------------------
  // ⚙️ 3️⃣ 수신 데이터 파싱 유틸리티
  // --------------------------------------------------
  const parseWeight = useCallback((value) => {
    // ArrayBuffer → Hex String
    const hexStr = Array.from(new Uint8Array(value.buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // 저울 프로토콜 상 유효 데이터 추출
    const middleHex = hexStr.slice(16, 28).replace(/^0+/, '');
    return middleHex ? parseInt(middleHex, 16) : 0;
  }, []);

  // --------------------------------------------------
  // 🎯 4️⃣ Hook 반환
  // --------------------------------------------------
  return {
    weight,
    isConnected,
    isConnecting,
    error,
    deviceName,
    connect,
    disconnect,
  };
}
