import Button from "../components/Button";
import "../styles/pages.css";
import coverImage from "../assets/images/cover.png";
import logoBlack from "../assets/images/logo_black.png";
import almangLogo from "../assets/images/almang_logo.png";
import { useAudio } from "../hooks/useSound";

export default function HomePage({ onNext }) {
  const { play: playStartSound } = useAudio("voices/리필_시작.mp3");

  const handleStart = () => {
    playStartSound();
    onNext();
  };

  return (
    <div className="homeContainer">
      <div className="homeHeader">
        <div className="homeLogo">
          <img src={logoBlack} className="logo1" alt="logo1" />
          <span>×</span>
          <img src={almangLogo} className="logo2" alt="" />
        </div>
      </div>
      <div className="homeContent">
        <img src={coverImage} alt="Cover" />
      </div>
      <div className="homeFooter">
        <Button className="startButton" onClick={handleStart}>
          리필 시작
        </Button>
      </div>
    </div>
  );
}
