"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Camera, X, Check, Loader2, RotateCcw, Volume2, PenLine } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useVoiceCapture } from "@/lib/useVoiceCapture";
import MicButton from "@/components/MicButton";
import CategoryTile from "@/components/CategoryTile";
import { PillButton } from "@/components/PillButton";
import { CATEGORY_LIST } from "@/lib/categoryMeta";
import { Category, submitComplaint } from "@/lib/api";

type Step = "choose" | "listening" | "photo" | "typing" | "review" | "sending" | "done" | "rejected";

export default function ReportPage() {
  return (
    <Suspense fallback={null}>
      <ReportFlow />
    </Suspense>
  );
}

function ReportFlow() {
  const { t, lang, speak } = useLang();
  const params = useSearchParams();
  const router = useRouter();
  const langCode = lang === "hi" ? "hi-IN" : "en-IN";
  const voice = useVoiceCapture(langCode);

  const initialMode = params.get("mode");
  const initialCategory = params.get("category") as Category | null;

  const [step, setStep] = useState<Step>("choose");
  const [category, setCategory] = useState<Category | null>(initialCategory);
  const [typedText, setTypedText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [finalText, setFinalText] = useState("");
  const [mode, setMode] = useState<"Voice" | "Text" | "Photo">("Voice");
  const [rejectReason, setRejectReason] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMode === "voice") beginListening();
    else if (initialMode === "photo") fileInputRef.current?.click();
    else if (initialMode === "text") setStep("typing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function beginListening() {
    setMode("Voice");
    setStep("listening");
    voice.start();
    speak(t.listening);
  }

  function stopListening() {
    voice.stop();
    const text = voice.transcript || "";
    setFinalText(buildText(text));
    setStep(text ? "review" : "choose");
  }

  function buildText(base: string) {
    if (category) return `${category}: ${base}`;
    return base;
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setStep("choose");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMode("Photo");
    setFinalText(buildText(typedText || (category ? `${category} issue` : "Issue reported via photo")));
    setStep("review");
  }

  function submitTyped() {
    setMode("Text");
    setFinalText(buildText(typedText));
    setStep("review");
  }

  async function handleSend() {
    setStep("sending");
    const res = await submitComplaint({ text: finalText, mode, image: photo });
    if (res.status === "rejected") {
      setRejectReason(res.reason || "");
      setStep("rejected");
      speak(t.cancel);
      return;
    }
    setStep("done");
    speak(t.submitted);
  }

  function resetAll() {
    setStep("choose");
    setCategory(null);
    setTypedText("");
    setPhoto(null);
    setPhotoPreview(null);
    setFinalText("");
    voice.reset();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoChange}
      />

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">{t.report}</h1>
        <button
          onClick={() => router.push("/")}
          aria-label={t.cancel}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border-[3px] border-ink bg-white shadow-hard-sm"
        >
          <X size={18} />
        </button>
      </div>

      {/* Category quick-pick, always visible while choosing/listening/typing */}
      {(step === "choose" || step === "listening" || step === "typing") && (
        <section className="mt-5">
          <div className="grid grid-cols-3 gap-2">
            {CATEGORY_LIST.map((cat) => (
              <CategoryTile
                key={cat}
                category={cat}
                label={t.categories[cat]}
                selected={category === cat}
                onSelect={(c) => setCategory((prev) => (prev === c ? null : c))}
              />
            ))}
          </div>
        </section>
      )}

      {step === "choose" && (
        <section className="mt-8 flex flex-1 flex-col items-center justify-center gap-6 pb-16">
          <MicButton listening={false} onClick={beginListening} />
          <button onClick={beginListening} className="font-display text-lg font-bold">
            {t.tapToSpeak}
          </button>
          <div className="grid w-full max-w-xs grid-cols-2 gap-3">
            <PillButton onClick={() => fileInputRef.current?.click()} variant="accent" icon={Camera}>
              {t.takePhoto}
            </PillButton>
            <PillButton onClick={() => setStep("typing")} variant="light" icon={PenLine}>
              {t.typeInstead}
            </PillButton>
          </div>
        </section>
      )}

      {step === "listening" && (
        <section className="mt-8 flex flex-1 flex-col items-center justify-center gap-6 pb-16">
          <MicButton listening onClick={stopListening} />
          <p className="font-display text-lg font-bold text-clay">{t.listening}</p>
          <p className="min-h-[3rem] max-w-xs text-center text-base text-ink/70">
            {voice.transcript || "…"}
          </p>
          <PillButton onClick={stopListening} variant="marigold" className="w-auto px-6">
            {t.tapWhenDone}
          </PillButton>
          {!voice.supported && (
            <p className="max-w-xs text-center text-sm text-ink/50">
              Voice typing isn't supported in this browser — try {t.typeInstead.toLowerCase()}.
            </p>
          )}
        </section>
      )}

      {step === "typing" && (
        <section className="mt-6 flex flex-1 flex-col gap-4 pb-16">
          <textarea
            autoFocus
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder={t.typePlaceholder}
            rows={6}
            className="w-full flex-1 resize-none rounded-3xl border-[3px] border-ink bg-white p-4 text-lg shadow-hard-sm outline-none"
          />
          <PillButton disabled={!typedText.trim()} onClick={submitTyped} variant="marigold" className="h-14 text-lg">
            {t.submitReport}
          </PillButton>
        </section>
      )}

      {step === "review" && (
        <section className="mt-6 flex flex-1 flex-col gap-4 pb-16">
          <div className="rounded-3xl border-[3px] border-ink bg-white p-4 shadow-hard-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-sm font-bold text-ink/50">{t.listenBack}</span>
              <button
                onClick={() => speak(finalText)}
                aria-label="Play back"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo text-white"
              >
                <Volume2 size={16} />
              </button>
            </div>
            <p className="text-lg leading-snug">{finalText}</p>
          </div>

          {photoPreview && (
            <div className="relative overflow-hidden rounded-3xl border-[3px] border-ink shadow-hard-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Attached" className="h-48 w-full object-cover" />
              <button
                onClick={() => {
                  setPhoto(null);
                  setPhotoPreview(null);
                }}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-white"
                aria-label={t.removePhoto}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="mt-auto flex gap-3">
            <PillButton onClick={resetAll} variant="light" icon={RotateCcw} className="w-auto flex-1">
              {t.recordAgain}
            </PillButton>
            <PillButton onClick={handleSend} variant="success" icon={Check} className="w-auto flex-1">
              {t.send}
            </PillButton>
          </div>
        </section>
      )}

      {step === "sending" && (
        <section className="mt-8 flex flex-1 flex-col items-center justify-center gap-4 pb-16">
          <Loader2 size={48} className="animate-spin text-indigo" />
          <p className="font-display text-lg font-bold">{t.processing}</p>
        </section>
      )}

      {step === "done" && (
        <section className="mt-8 flex flex-1 flex-col items-center justify-center gap-4 pb-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-[5px] border-ink bg-peacock shadow-hard">
            <Check size={48} className="text-white" strokeWidth={3} />
          </div>
          <p className="font-display text-2xl font-extrabold">{t.submitted}</p>
          <p className="text-ink/60">{t.submittedSub}</p>
          <div className="mt-4 grid w-full max-w-xs grid-cols-2 gap-3">
            <PillButton onClick={resetAll} variant="light" className="w-auto">
              {t.report}
            </PillButton>
            <PillButton onClick={() => router.push("/track")} variant="marigold" className="w-auto">
              {t.track}
            </PillButton>
          </div>
        </section>
      )}

      {step === "rejected" && (
        <section className="mt-8 flex flex-1 flex-col items-center justify-center gap-4 pb-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-[5px] border-ink bg-clay shadow-hard">
            <X size={48} className="text-white" strokeWidth={3} />
          </div>
          <p className="max-w-xs text-ink/70">{rejectReason}</p>
          <PillButton onClick={resetAll} variant="light" className="w-auto max-w-xs px-6">
            {t.recordAgain}
          </PillButton>
        </section>
      )}
    </main>
  );
}
