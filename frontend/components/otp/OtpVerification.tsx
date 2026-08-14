"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import "./OtpVerification.css";

interface OtpVerificationProps {
  length?: number;
  lifetimeSeconds?: number;
  resendCooldownSeconds?: number;
  onVerify: (code: string) => Promise<void>;
  onResend?: () => Promise<void>;
}

interface StatusOverride {
  type: "ok" | "bad";
  text: string;
}

type Phase = "entry" | "orbiting" | "success";

const ROW_PITCH = 58;
const ORBIT_RADIUS = 108;

export function OtpVerification({
  length = 6,
  lifetimeSeconds = 600,
  resendCooldownSeconds = 30,
  onVerify,
  onResend,
}: OtpVerificationProps) {
  const [phase, setPhase] = useState<Phase>("entry");
  const [spinning, setSpinning] = useState(false);
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(lifetimeSeconds);
  const [resendLeft, setResendLeft] = useState(resendCooldownSeconds);
  const [status, setStatus] = useState<StatusOverride | null>(null);
  const [resending, setResending] = useState(false);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const toastTimerRef = useRef<number | null>(null);
  const spinTimerRef = useRef<number | null>(null);

  const expired = secondsLeft <= 0;
  const orbiting = phase === "orbiting";
  const success = phase === "success";
  const code = digits.join("");
  const complete = code.length === length;

  const slotPosition = (index: number) => {
    if (phase === "entry") {
      return { x: (index - (length - 1) / 2) * ROW_PITCH, y: 0 };
    }
    const angle = (index / length) * Math.PI * 2 - Math.PI / 2;
    return {
      x: Math.round(Math.sin(angle) * ORBIT_RADIUS),
      y: Math.round(-Math.cos(angle) * ORBIT_RADIUS),
    };
  };

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  useEffect(() => {
    if (resendLeft <= 0) return;
    const id = window.setTimeout(() => setResendLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [resendLeft]);

  useEffect(() => {
    const timer = toastTimerRef.current;
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus({ preventScroll: true });
  }, []);

  const focusIndex = (index: number) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const updateDigits = (next: string[]) => {
    setDigits(next);
    setStatus(null);
  };

  const handleChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const digit = event.target.value.replace(/\D/g, "").slice(-1);
      const next = [...digits];
      next[index] = digit;
      updateDigits(next);
      if (digit) focusIndex(index + 1);
    };

  const handleKeyDown =
    (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace" && !digits[index] && index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        updateDigits(next);
        focusIndex(index - 1);
      } else if (event.key === "ArrowLeft") {
        focusIndex(index - 1);
      } else if (event.key === "ArrowRight") {
        focusIndex(index + 1);
      } else if (event.key === "Enter") {
        if (complete && !orbiting && !expired) void verify();
      }
    };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((digit, i) => {
      if (i < length) next[i] = digit;
    });
    updateDigits(next);
    focusIndex(Math.min(pasted.length, length - 1));
  };

  const verify = async () => {
    if (code.length !== length) {
      setStatus({ type: "bad", text: "Enter all digits" });
      return;
    }
    setPhase("orbiting");
    if (spinTimerRef.current) window.clearTimeout(spinTimerRef.current);
    spinTimerRef.current = window.setTimeout(() => setSpinning(true), 700);
    try {
      await onVerify(code);
      if (spinTimerRef.current) window.clearTimeout(spinTimerRef.current);
      setSpinning(false);
      setPhase("success");
    } catch {
      if (spinTimerRef.current) window.clearTimeout(spinTimerRef.current);
      setSpinning(false);
      setPhase("entry");
      setStatus({ type: "bad", text: "Incorrect verification code" });
      showToast("That code didn't match. Please try again.");
      setDigits(Array(length).fill(""));
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      focusIndex(0);
    }
  };

  const resend = async () => {
    if (resendLeft > 0 || resending || orbiting) return;
    setResending(true);
    try {
      await onResend?.();
      setDigits(Array(length).fill(""));
      setStatus({ type: "ok", text: "New code sent" });
      setSecondsLeft(lifetimeSeconds);
      setResendLeft(resendCooldownSeconds);
      showToast("A new verification code has been sent");
      focusIndex(0);
    } catch {
      setStatus({ type: "bad", text: "Could not resend code" });
      showToast("Could not send a new code. Try again shortly.");
    } finally {
      setResending(false);
    }
  };

  const statusText = success
    ? "Verification successful"
    : expired
      ? "Code expired"
      : status
        ? status.text
        : orbiting
          ? "Verifying your code…"
          : complete
            ? "Code ready to verify"
            : "Waiting for code";

  const statusType = success ? "ok" : expired ? "bad" : status ? status.type : "";
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="otp-verification">
      <div
        className={cn(
          "otp-stage",
          phase === "entry" && "otp-stage--entry",
          (orbiting || success) && "otp-stage--orbit",
          success && "otp-stage--success",
          shake && "otp-shake",
        )}
      >
        <div
          className={cn("otp-orbit", (orbiting || success) && "otp-orbit--active")}
          aria-hidden
        >
          <svg
            className={cn("otp-orbit__ring", orbiting && "otp-orbit__ring--spinning")}
            viewBox="0 0 160 160"
          >
            <circle cx="80" cy="80" r="58" />
          </svg>
          <div className="otp-orbit__hub" />
        </div>

        {!success && (
          <div className="otp-slots" role="group" aria-label="One-time password">
            <div className={cn("otp-orbit-carousel", spinning && "otp-orbit-carousel--spinning")}>
              {Array.from({ length }, (_, index) => {
                const pos = slotPosition(index);
                return (
                  <div
                    key={index}
                    className="otp-slot"
                    style={{ "--x": `${pos.x}px`, "--y": `${pos.y}px` } as React.CSSProperties}
                  >
                    <input
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      className={cn("otp-input", digits[index] && "otp-input-filled")}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      aria-label={`Digit ${index + 1}`}
                      value={digits[index]}
                      disabled={orbiting || expired}
                      onChange={handleChange(index)}
                      onKeyDown={handleKeyDown(index)}
                      onPaste={handlePaste}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {success && (
          <div className="otp-success-check">
            <Check width={40} height={40} strokeWidth={3} aria-hidden />
          </div>
        )}
      </div>

      <div className="otp-status-row">
        <span className={cn("otp-status-dot", statusType && `otp-status-dot--${statusType}`)} />
        <span>{statusText}</span>
        <span className="otp-timer">
          {minutes}:{seconds}
        </span>
      </div>

      <button
        type="button"
        className="otp-verify-btn"
        onClick={() => void verify()}
        disabled={!complete || orbiting || expired}
      >
        <span>{orbiting ? "Verifying…" : "Verify code"}</span>
        <span className="otp-verify-arrow">
          <ArrowUpRight width={16} height={16} aria-hidden />
        </span>
      </button>

      <button
        type="button"
        className="otp-resend-btn"
        onClick={() => void resend()}
        disabled={resendLeft > 0 || resending || orbiting}
      >
        {resendLeft > 0 ? `Resend code in ${resendLeft}s` : "Resend code"}
      </button>

      {toast && (
        <div className="otp-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}