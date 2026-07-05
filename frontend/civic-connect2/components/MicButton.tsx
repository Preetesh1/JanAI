"use client";

import { Mic, Square } from "lucide-react";

export default function MicButton({
  listening,
  onClick,
  disabled,
}: {
  listening: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative flex items-center justify-center">
      {listening && (
        <>
          <span className="absolute h-40 w-40 rounded-full bg-clay/40 animate-pulseRing" />
          <span
            className="absolute h-40 w-40 rounded-full bg-clay/40 animate-pulseRing"
            style={{ animationDelay: "0.5s" }}
          />
        </>
      )}
      <button
        onClick={onClick}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? "Stop recording" : "Start recording"}
        className={`relative flex h-36 w-36 items-center justify-center rounded-full border-[5px] border-ink shadow-hard transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-40 ${
          listening ? "bg-clay" : "bg-marigold"
        }`}
      >
        {listening ? (
          <Square size={44} strokeWidth={2.5} className="text-white" fill="white" />
        ) : (
          <Mic size={56} strokeWidth={2.5} className="text-ink" />
        )}
      </button>
    </div>
  );
}
