import { useEffect } from "react";
import Button from "../components/Button";
import "../styles/pages.css";
import coverImage from "../assets/images/cover.png";
import logoBlack from "../assets/images/logo_black.png";
import almangLogo from "../assets/images/almang_logo.png";

export default function HomePage({ onNext }) {
  // 전체화면 모드 진입
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        // 전체화면 API 지원 확인
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          console.log("✅ [Fullscreen] 전체화면 모드 활성화");
        }
      } catch (err) {
        console.warn("⚠️ [Fullscreen] 전체화면 모드 진입 실패:", err);
      }
    };

    // 사용자 인터랙션 후 전체화면 진입
    const handleInteraction = () => {
      enterFullscreen();
      // 한 번만 실행하도록 이벤트 리스너 제거
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    // 클릭 또는 터치 이벤트 대기
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="home-logo">
          <img src={logoBlack} className="logo1" />
          <span>×</span>
          <img src={almangLogo} className="logo2" />
        </div>
      </div>
      <div className="home-content">
        <img src={coverImage} />
      </div>
      <div className="home-footer">
        <Button onClick={onNext}>리필 시작</Button>
      </div>
    </div>
  );
}
