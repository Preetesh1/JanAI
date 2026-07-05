"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "listening" | "no-support";

export function useVoiceCapture(langCode: string) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setStatus("no-support");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i][0].transcript;
      }
      setTranscript(combined.trim());
    };
    recognition.onerror = () => {
      setStatus("idle");
    };
    recognition.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
    };
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.lang = langCode;
  }, [langCode]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    try {
      recognitionRef.current.start();
      setStatus("listening");
    } catch {
      // already started — ignore
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setStatus("idle");
  }, []);

  const reset = useCallback(() => setTranscript(""), []);

  return { status, transcript, start, stop, reset, supported: status !== "no-support" };
}
