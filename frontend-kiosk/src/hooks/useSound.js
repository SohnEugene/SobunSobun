import { useCallback, useRef } from "react";

/**
 * * 오디오 재생을 위한 커스텀 훅입니다.
 * <Audio /> 객체를 관리하고 재생 로직을 단순화합니다.
 * * @param filename public 폴더 내의 오디오 파일 이름 (예: 'a.mp3', 'success.wav')
 * @returns play: 오디오 재생 함수
 */
export const useAudio = (filename) => {
  // Audio 객체를 한 번만 생성하도록 useRef에 저장합니다.
  const audioRef = useRef(null);

  // 오디오 객체를 초기화하거나 가져옵니다.
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      // public 폴더의 파일은 루트 경로('/')로 접근합니다.
      const newAudio = new Audio(`/${filename}`);
      audioRef.current = newAudio;
    }
    return audioRef.current;
  }, [filename]);

  const play = useCallback(() => {
    const audio = getAudio();

    // 소리가 이미 재생 중일 때, 처음부터 다시 재생하도록 시간을 0으로 돌립니다.
    if (audio.currentTime > 0 && !audio.paused) {
      audio.currentTime = 0;
    }

    // play()를 호출하고 브라우저 자동 재생 정책 위반 에러를 처리합니다.
    audio.play().catch((error) => {
      console.error(`Audio playback for ${filename} failed:`, error);
    });
  }, [getAudio, filename]);

  return { play };
};
