"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
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

export function OtpVerification({
  length = 6,
  lifetimeSeconds = 600,
  resendCooldownSeconds = 30,
  onVerify,
  onResend,
}: OtpVerificationProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(lifetimeSeconds);
  const [resendLeft, setResendLeft] = useState(resendCooldownSeconds);
  const [status, setStatus] = useState<StatusOverride | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [shake, setShake] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const toastTimerRef = useRef<number | null>(null);

  const expired = secondsLeft <= 0;
  const code = digits.join("");
  const complete = code.length === length;

  const positions = Array.from({ length }, (_, i) => {
    const t = length === 1 ? 0 : i / (length - 1);
    const angle = -1 + t * 2;
    const r = 100;
    return {
      x: Math.round(Math.sin(angle) * r),
      y: Math.round(-Math.cos(angle) * r),
    };
  });

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
    inputRefs.current[0]?.focus();
  }, []);

  const focusIndex = (index: number) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const animateSlot = (index: number) => {
    const slot = slotRefs.current[index];
    if (!slot) return;
    const base = getComputedStyle(slot).transform;
    slot.animate(
      [
        { transform: base, opacity: 0.65 },
        { transform: `${base} scale(1.09)`, opacity: 1 },
        { transform: base, opacity: 1 },
      ],
      { duration: 360, easing: "cubic-bezier(.22,.8,.18,1)" },
    );
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
      if (digit) {
        animateSlot(index);
        focusIndex(index + 1);
      }
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
        if (complete && !verifying && !expired) void verify();
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
    setVerifying(true);
    try {
      await onVerify(code);
      setVerified(true);
      setStatus({ type: "ok", text: "Verification successful" });
      setPulse(true);
      window.setTimeout(() => setPulse(false), 600);
    } catch {
      setStatus({ type: "bad", text: "Incorrect verification code" });
      showToast("That code didn't match. Please try again.");
      setDigits(Array(length).fill(""));
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      focusIndex(0);
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (resendLeft > 0 || resending || verifying) return;
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

  const statusText = expired
    ? "Code expired"
    : status
      ? status.text
      : complete
        ? "Code ready to verify"
        : "Waiting for code";

  const statusType = expired ? "bad" : status ? status.type : "";
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="otp-verification">
      <div
        className={cn(
          "otp-stage",
          shake && "otp-shake",
          pulse && "otp-success-pulse",
        )}
      >
        <div className="otp-orbit" aria-hidden>
          <svg className="otp-orbit__ring" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="58" />
          </svg>
          <div className="otp-orbit__hub" />
        </div>

        <div className="otp-slots" role="group" aria-label="One-time password">
          {positions.map((pos, index) => (
            <div
              key={index}
              className="otp-slot"
              ref={(el) => {
                slotRefs.current[index] = el;
              }}
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
                disabled={verified || expired}
                onChange={handleChange(index)}
                onKeyDown={handleKeyDown(index)}
                onPaste={handlePaste}
              />
            </div>
          ))}
        </div>
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
        disabled={!complete || verifying || expired}
      >
        <span>{verifying ? "Verifying…" : "Verify code"}</span>
        <span className="otp-verify-arrow">
          <ArrowUpRight width={16} height={16} aria-hidden />
        </span>
      </button>

      <button
        type="button"
        className="otp-resend-btn"
        onClick={() => void resend()}
        disabled={resendLeft > 0 || resending || verifying}
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