"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Printer, Scissors, Volume2, VolumeX } from "lucide-react";
import "./ReceiptPrinter.css";
import { formatINR } from "@/lib/utils";

export interface ReceiptPrinterProps {
  reference: string;
  eventTitle: string;
  eventDate: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  fees: number;
  total: number;
  paidOn: string;
  paidLabel?: string;
  mode?: "smooth" | "classic";
  autoPrint?: boolean;
}

type Phase = "retracted" | "printing" | "printed" | "tearing";

const PRINT_MS = 2500;
const TEAR_MS = 550;
const RETRACT_MS = 300;

export function ReceiptPrinter({
  reference,
  eventTitle,
  eventDate,
  ticketTypeName,
  quantity,
  unitPrice,
  subtotal,
  fees,
  total,
  paidOn,
  paidLabel = "PAYMENT SUCCESSFUL",
  mode = "smooth",
  autoPrint = true,
}: ReceiptPrinterProps) {
  const [phase, setPhase] = useState<Phase>("retracted");
  const [soundOn, setSoundOn] = useState(true);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const paperRef = useRef<HTMLDivElement>(null);
  const cutterRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);
  const soundOnRef = useRef(true);
  const busyRef = useRef(false);
  const printedRef = useRef(false);

  const metaDate = new Date(paidOn)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtor) audioCtxRef.current = new AudioCtor();
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playPrinterSound = useCallback((durationMs: number) => {
    if (!soundOnRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = durationMs / 1000;

    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(600, now);
    filter.Q.setValueAtTime(3.5, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.04, now + 0.08);
    gainNode.gain.setValueAtTime(0.04, now + duration - 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);
  }, []);

  const playTearSound = useCallback(() => {
    if (!soundOnRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.35;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.06));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1400, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }, []);

  const print = useCallback(() => {
    if (busyRef.current) return;

    paperRef.current?.classList.remove(
      "rp-tearing",
      "rp-retracted",
      "rp-printed",
      "rp-printing-classic",
      "rp-printing-smooth",
      "rp-vibrating",
    );
    void paperRef.current?.offsetWidth;

    busyRef.current = true;
    playPrinterSound(PRINT_MS);
    setPhase("printing");

    if (mode === "classic") {
      paperRef.current?.classList.add("rp-printing-classic", "rp-vibrating");
    } else {
      paperRef.current?.classList.add("rp-printing-smooth");
    }

    later(() => {
      paperRef.current?.classList.remove(
        "rp-printing-classic",
        "rp-printing-smooth",
        "rp-vibrating",
      );
      paperRef.current?.classList.add("rp-printed");
      busyRef.current = false;
      printedRef.current = true;
      setPhase("printed");
    }, PRINT_MS);
  }, [mode, playPrinterSound]);

  const tear = useCallback(() => {
    if (busyRef.current || !printedRef.current) return;

    playTearSound();
    if (cutterRef.current) {
      cutterRef.current.classList.remove("rp-cutter-active");
      void cutterRef.current.offsetWidth;
      cutterRef.current.classList.add("rp-cutter-active");
    }

    paperRef.current?.classList.add("rp-tearing");
    busyRef.current = true;
    setPhase("tearing");

    later(() => {
      paperRef.current?.classList.remove("rp-tearing", "rp-printed");
      paperRef.current?.classList.add("rp-retracted");
      cutterRef.current?.classList.remove("rp-cutter-active");
      busyRef.current = false;
      printedRef.current = false;
      setPhase("retracted");
    }, TEAR_MS);
  }, [playTearSound]);

  const handlePrintClick = () => {
    getAudioContext();
    if (printedRef.current) {
      paperRef.current?.classList.remove("rp-printed");
      paperRef.current?.classList.add("rp-retracted");
      printedRef.current = false;
      later(print, RETRACT_MS);
    } else {
      print();
    }
  };

  useEffect(() => {
    if (!autoPrint) return;
    const id = window.setTimeout(print, 600);
    timersRef.current.push(id);
    return () => window.clearTimeout(id);
  }, [autoPrint, print]);

  useEffect(() => {
    if (phase === "printed" && paperRef.current) {
      setSpacerHeight(paperRef.current.offsetHeight);
    }
    if (phase === "retracted") {
      setSpacerHeight(0);
    }
  }, [phase]);

  const toggleSound = () => {
    soundOnRef.current = !soundOnRef.current;
    setSoundOn(soundOnRef.current);
    if (soundOnRef.current) getAudioContext();
  };

  const statusTitle =
    phase === "printing"
      ? "Printing receipt…"
      : phase === "tearing"
        ? "Receipt cut & torn"
        : "Payment successful";

  const statusSub =
    phase === "printing"
      ? "Your receipt is rolling out — just a moment."
      : phase === "printed"
        ? "You're all set. Tear your receipt when ready."
        : phase === "tearing"
          ? "Ready to print a fresh copy anytime."
          : "Get ready to grab your receipt.";

  return (
    <div className="receipt-stage">
      <div className="rp-printer-stage">
        <div className="rp-machine-unit">
          <div className="rp-machine-hood-top">
            <div className="rp-hood-highlight"></div>
          </div>

          <div className="rp-machine-slot-slit"></div>

          <div className="rp-cutter-blade-flash" ref={cutterRef}></div>

          <div className="rp-machine-hood-bottom">
            <div className="rp-hood-shadow"></div>
          </div>

          <div className="rp-paper-viewport">
            <div
              className="rp-receipt-paper-wrapper rp-retracted"
              ref={paperRef}
            >
              <div className="rp-receipt-content">
                <div className="rp-receipt-header">
                  <div className="rp-header-brand-info">
                    <div className="rp-brand-company-name">EVENTORA</div>
                    <div className="rp-payment-title">EVENT TICKET RECEIPT</div>
                  </div>
                  <div className="rp-logo-badge">
                    <span className="rp-logo-initial">E</span>
                  </div>
                </div>

                <div className="rp-receipt-amount-section">
                  <div className="rp-receipt-amount">{formatINR(total)}</div>
                  <div className="rp-receipt-meta">
                    {metaDate} | {paidLabel}
                  </div>
                </div>

                <div className="rp-receipt-divider"></div>

                <div className="rp-receipt-items-list">
                  <div className="rp-receipt-item-row">
                    <span className="rp-item-name">{eventTitle}</span>
                    <span className="rp-item-price">
                      {eventDate.toUpperCase()}
                    </span>
                  </div>
                  <div className="rp-receipt-item-row">
                    <span className="rp-item-name">
                      {quantity}X {ticketTypeName}
                    </span>
                    <span className="rp-item-price">₹{unitPrice}</span>
                  </div>
                </div>

                <div className="rp-receipt-divider"></div>

                <div className="rp-receipt-totals-section">
                  <div className="rp-total-row">
                    <span>Subtotal</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  <div className="rp-total-row">
                    <span>Platform fee</span>
                    <span>{formatINR(fees)}</span>
                  </div>

                  <div className="rp-receipt-grand-total">
                    <span>TOTAL</span>
                    <span>{formatINR(total)}</span>
                  </div>
                </div>

                <div className="rp-receipt-footer">
                  <div className="rp-footer-msg">HAVE A GREAT SHOW!</div>
                  <div className="rp-barcode-graphic">
                    <div className="rp-barcode-lines"></div>
                    <div className="rp-barcode-num">{reference}</div>
                  </div>
                </div>
              </div>

              <div className="rp-serrated-edge"></div>
            </div>
          </div>
          </div>

          <div style={{ height: spacerHeight }} aria-hidden />

          <section className="rp-stage-info">
          <h1 className="rp-status-heading">{statusTitle}</h1>
          <p className="rp-status-subtext">{statusSub}</p>

          <div className="rp-centered-action-bar">
            <button
              type="button"
              className="rp-print-action-btn"
              onClick={handlePrintClick}
              disabled={phase === "printing"}
            >
              <Printer width={20} height={20} aria-hidden />
              <span>{phase === "printed" ? "Re-print receipt" : "Print receipt"}</span>
            </button>

            {phase === "printed" && (
              <button type="button" className="rp-secondary-action-btn" onClick={tear}>
                <Scissors width={18} height={18} aria-hidden />
                <span>Tear receipt</span>
              </button>
            )}

            <button
              type="button"
              className="rp-sound-btn"
              onClick={toggleSound}
              aria-label={soundOn ? "Mute printer sounds" : "Unmute printer sounds"}
              title={soundOn ? "Mute printer sounds" : "Unmute printer sounds"}
            >
              {soundOn ? <Volume2 width={17} height={17} /> : <VolumeX width={17} height={17} />}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
