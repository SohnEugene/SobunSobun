// src/pages/RefillStartPage.jsx
import { useState, useEffect, useRef } from "react";
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { useSession } from "../contexts/SessionContext";
import { useBluetoothContext } from "../contexts/BluetoothContext";
import scaleImg from "../assets/images/measurement.png";

// 리필 단계
const REFILL_STEPS = {
  WELCOME: "welcome", // 온보딩 시작
  CONNECT_SCALE: "connect", // 저울 연결
  EMPTY_CONTAINER: "empty", // 빈 병을 올리세요
  TARE_WEIGHT: "tare", // 병 무게 측정 완료
  FILL_PRODUCT: "fill", // 샴푸를 담은 병을 올리세요
};

export default function RefillStartPage({ onNext, onReset, onHome }) {
  const [step, setStep] = useState(REFILL_STEPS.WELCOME);
  const [stableWeight, setStableWeight] = useState(false);
  const [devWeight, setDevWeight] = useState(null); // 개발용 override weight
  const weightRef = useRef(0);

  const {
    session,
    setBottleWeight,
    setCombinedWeight,
    calculateTotalPrice,
    resetSession,
  } = useSession();

  const {
    weight: btWeight,
    isConnected,
    isConnecting,
    connect,
  } = useBluetoothContext();

  const displayWeight = devWeight !== null ? devWeight : btWeight;

  // 개발용: 콘솔에서 무게를 설정할 수 있도록 전역 함수 노출
  useEffect(() => {
    // 전역 함수 추가
    window.setWeight = (weight) => {
      console.log(`🔧 [DEV] 무게를 ${weight}g로 설정합니다`);
      setDevWeight(weight);
    };

    window.resetWeight = () => {
      console.log("🔧 [DEV] 무게를 블루투스 값으로 초기화합니다");
      setDevWeight(null);
    };

    window.getCurrentStep = () => {
      console.log("🔧 [DEV] 현재 단계:", step);
      console.log("🔧 [DEV] 현재 무게:", displayWeight);
      console.log("🔧 [DEV] 공병 무게:", session.bottleWeight);
      console.log("🔧 [DEV] isConnected:", isConnected);
      return { step, weight: displayWeight, bottleWeight: session.bottleWeight, isConnected };
    };

    // 컴포넌트 언마운트 시 정리
    return () => {
      delete window.setWeight;
      delete window.resetWeight;
      delete window.getCurrentStep;
    };
  }, [step, displayWeight, session.bottleWeight, isConnected]);

  // step 변경 시 로그
  useEffect(() => {
    console.log("Step changed to:", step);
    console.log("SessionContext:", session);
  }, [step, session]);

  // 시작 화면 자동 진행
  useEffect(() => {
    if (step === REFILL_STEPS.WELCOME) {
      const timer = setTimeout(() => {
        handleWelcomeNext();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleWelcomeNext = () => {
    if (isConnected || devWeight !== null) {
      setStep(REFILL_STEPS.EMPTY_CONTAINER);
    } else {
      setStep(REFILL_STEPS.CONNECT_SCALE);
    }
  };

  // 저울 연결 후 자동 진행
  useEffect(() => {
    if ((isConnected || devWeight !== null) && step === REFILL_STEPS.CONNECT_SCALE) {
      setStep(REFILL_STEPS.EMPTY_CONTAINER);
    }
  }, [isConnected, step, devWeight]);

  // 무게 안정화 감지
  useEffect(() => {
    let timer;
    if (step === REFILL_STEPS.EMPTY_CONTAINER) {
      if (displayWeight > 0) {
        if (weightRef.current !== displayWeight) {
          setStableWeight(false);
          weightRef.current = displayWeight;
        }
        timer = setTimeout(() => setStableWeight(true), 1000);
      } else {
        setStableWeight(false);
      }
    }

    if (step === REFILL_STEPS.FILL_PRODUCT) {
      if (displayWeight > session.bottleWeight) {
        if (weightRef.current !== displayWeight) {
          setStableWeight(false);
          weightRef.current = displayWeight;
        }
        timer = setTimeout(() => setStableWeight(true), 1000);
      } else {
        setStableWeight(false);
      }
    }

    return () => clearTimeout(timer);
  }, [displayWeight, step, session.bottleWeight]);

  // 공병 무게 완료
  const handleTareComplete = () => {
    setBottleWeight(displayWeight);
    setStep(REFILL_STEPS.TARE_WEIGHT);
    setTimeout(() => setStep(REFILL_STEPS.FILL_PRODUCT), 3000);
  };

  // 리필 완료
  const handleFillComplete = () => {
    const fillWeight = displayWeight - session.bottleWeight;
    setCombinedWeight(displayWeight);
    calculateTotalPrice(fillWeight);
    if (onNext) onNext();
  };

  // 개발용 X 키 단축
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "x" || event.key === "X") {
        console.log("⚡ 개발용 X 키 눌림, 현재 단계:", step);
        if (step === REFILL_STEPS.CONNECT_SCALE) {
          console.log("→ 저울 연결 단계 스킵: 무게 50g 설정 후 공병 측정 단계로 이동");
          setDevWeight(50); // 공병 무게 세팅
          setStep(REFILL_STEPS.EMPTY_CONTAINER);
        } else if (step === REFILL_STEPS.EMPTY_CONTAINER) {
          console.log("→ 공병 무게 50g 확정 후 리필 단계로 이동");
          setDevWeight(50); // 공병 무게
          handleTareComplete();
        } else if (step === REFILL_STEPS.FILL_PRODUCT) {
          console.log("→ 리필 무게 애니메이션 시작 (목표: 400g)");
          let current = session.bottleWeight;
          const target = 400;
          const interval = setInterval(() => {
            current += 10;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            setDevWeight(current);
          }, 100);
        } else {
          console.log("→ 이 단계에서는 X 키가 동작하지 않습니다");
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, session.bottleWeight, handleTareComplete]);

  // ===================== 렌더링 =====================
  if (step === REFILL_STEPS.WELCOME) {
    return (
      <div className="kiosk-page-primary" style={{ cursor: "default" }}>
        <div className="kiosk-content-center">
          <h1 className="kiosk-title-light">
            지금부터
            <br />
            리필을 시작할게요
          </h1>
        </div>
      </div>
    );
  }

  if (step === REFILL_STEPS.CONNECT_SCALE) {
    return (
      <div className="kiosk-page-primary">
        <KioskHeader onHome={onHome} variant="light" />
        <div className="kiosk-content">
          <div className="kiosk-content-header">
            <h1 className="kiosk-title-light">저울을 연결해주세요</h1>
            <div className="kiosk-subtitle-light">
              블루투스로 무게 데이터를 받아옵니다
            </div>
          </div>
          <img src={scaleImg} className="scale-image" alt="저울" />
          <Button
            variant="small"
            onClick={connect}
            disabled={isConnecting || isConnected || devWeight !== null}
          >
            {isConnecting
              ? "연결 중..."
              : isConnected || devWeight !== null
              ? "연결됨"
              : "저울 연결하기"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-page-primary">
      <KioskHeader onHome={onHome} variant="light" />

      {step === REFILL_STEPS.EMPTY_CONTAINER && (
        <>
          <div className="kiosk-content">
            <div className="kiosk-content-header">
              <h1 className="kiosk-title-light">
                빈 병을
                <br />
                저울에 올려주세요
              </h1>
              <div className="kiosk-subtitle-light">
                저울의 영점이 맞춰져 있는지 꼭 확인!
              </div>
            </div>
            <img className="scale-image" src={scaleImg} alt="저울" />
            <div className="refillWeightDisplay">
              현재 무게: {displayWeight}g
            </div>
          </div>
          <div className="kiosk-footer">
            <Button
              variant="outlined"
              onClick={handleTareComplete}
              disabled={!stableWeight}
            >
              무게 측정 완료
            </Button>
          </div>
        </>
      )}

      {step === REFILL_STEPS.TARE_WEIGHT && (
        <>
          <div className="kiosk-content">
            <div className="kiosk-content-header">
              <h1 className="kiosk-title-light">
                병의 무게는 {displayWeight}g이네요!
              </h1>
              <div className="kiosk-subtitle-light">
                이 값은 빼고 계산할게요.
              </div>
            </div>
          </div>
        </>
      )}

      {step === REFILL_STEPS.FILL_PRODUCT && (
        <>
          <div className="kiosk-content">
            <div className="kiosk-content-header">
              <h1 className="kiosk-title-light">
                이제 제품을 리필하시고
                <br />
                병을 다시 올려주세요
              </h1>
            </div>
            <img className="scale-image" src={scaleImg} alt="저울" />
            <div className="refillWeightDisplay">
              현재 무게: {displayWeight}g (빈 병: {session.bottleWeight}g)
            </div>
            {displayWeight > session.bottleWeight && (
              <div className="refillPricePreview">
                <div className="refillPriceCalculation">
                  ₩{session.selectedProduct?.price}/g × ({displayWeight} -{" "}
                  {session.bottleWeight})g
                  {session.purchaseContainer && " + ₩500"} &nbsp;=
                </div>
                <div className="refillPriceTotal">
                  ₩
                  {(
                    (session.selectedProduct?.price || 0) *
                      (displayWeight - session.bottleWeight) +
                    (session.purchaseContainer ? 500 : 0)
                  ).toLocaleString()}
                </div>
              </div>
            )}
          </div>
          <div className="kiosk-footer">
            <Button
              variant="outlined"
              onClick={handleFillComplete}
              disabled={!stableWeight}
            >
              결제하기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
