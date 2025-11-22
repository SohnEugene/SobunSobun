// src/pages/ContainerCheckPage.jsx
import Button from "../components/Button";
import styles from "../styles/pages.module.css";
import { useSession } from "../contexts/SessionContext";

export default function ContainerCheckPage({
  onHasContainer,
  onNoContainer,
  onHome,
}) {
  const { setHasContainer } = useSession();

  const handleYes = () => {
    // 용기 보유 여부 세션에 저장
    setHasContainer(true);
    onHasContainer();
  };

  const handleNo = () => {
    // 용기 보유하지 않음
    setHasContainer(false);
    onNoContainer();
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
          home
        </button>
      </div>
      <div className="kiosk-content">
        <div className="kiosk-content-center">
          <div className="kiosk-text-semibold">
            리필을 위해서는 빈 용기가 필요해요
          </div>
          <h1 className="kiosk-title" style={{ marginBottom: '64px' }}>
            상품을 담을 용기를 가지고 계신가요?
          </h1>

          <div className={styles.containerCheckIcon}>🤔</div>

          <div className="kiosk-button-container">
            <Button variant="double" onClick={handleNo}>
              아니요, 용기가 없어요
            </Button>

            <Button onClick={handleYes} variant="outlinedDouble">
              네, 용기를 가져왔어요
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
