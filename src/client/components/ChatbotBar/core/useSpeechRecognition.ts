// Hook bọc Web Speech API (SpeechRecognition) cho voice-to-text.
// Trả về transcript đầy đủ của phiên nói (cả final lẫn interim) qua callback onResult.
import { useCallback, useEffect, useRef, useState } from "react";

export function useSpeechRecognition(
  lang: string,
  onResult: (transcript: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Giữ callback mới nhất mà không phải tạo lại recognition mỗi render
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onresult = (event: any) => {
      // Ghép toàn bộ kết quả của phiên hiện tại (final + interim đang nói)
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onResultRef.current(transcript);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.start();
      setIsListening(true);
    } catch {
      /* start() ném lỗi nếu đang chạy — bỏ qua */
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
    setIsListening(false);
  }, []);

  return { isListening, supported, start, stop };
}
