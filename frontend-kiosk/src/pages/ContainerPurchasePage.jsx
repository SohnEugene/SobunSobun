// src/pages/ContainerPurchasePage.jsx
import Button from "../components/Button";
import styles from "../styles/pages.module.css";
import { useSession } from "../contexts/SessionContext";

export default function ContainerPurchasePage({ onYes, onNo, onHome }) {
  const { setPurchaseContainer } = useSession();

  const handlePurchase = () => {
    // 세션에 용기 구매 정보 저장
    setPurchaseContainer(true);
    onYes();
  };

  const handleSkip = () => {
    // 용기 구매하지 않음
    setPurchaseContainer(false);
    onNo();
  };

  const handleHomeClick = () => {
    if (onHome) onHome();
  };

  return (
    <div className="kiosk-page">
      <div className="kiosk-header">
        <button
          type="button"
          className="kiosk-home-button"
          onClick={handleHomeClick}
        >
          처음 화면으로
        </button>
      </div>
      <div className="kiosk-content">
        <img className="bottle-image"src="bottles.png" alt="" />

        <div className="kiosk-title">
          리필 전용 다회용기를
          <br />
          추가하시겠어요?
        </div>

        <div className="kiosk-button-container">
          <Button variant="double" onClick={handlePurchase}>
            추가하기 (500원)
          </Button>

          <Button onClick={handleSkip} variant="outlinedDouble">
            건너뛰기
          </Button>
        </div>
      </div>
    </div>
  );
}
