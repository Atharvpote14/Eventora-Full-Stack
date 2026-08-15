"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/Loader";
import { getErrorMessage } from "@/lib/api";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode: "popup";
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: string;
              size: string;
              text: string;
              shape: string;
              logo_alignment: string;
            },
          ) => void;
        };
      };
    };
  }
}

let scriptInjected = false;
let gsiInitialized = false;
let activeMount: HTMLElement | null = null;
let activeCallback: ((credential: string) => void) | null = null;

const BUTTON_OPTIONS = {
  theme: "outline",
  size: "large",
  text: "continue_with",
  shape: "rectangular",
  logo_alignment: "left",
} as const;

type Phase = "idle" | "waiting" | "creating" | "logging";

const ensureGsi = () => {
  if (!CLIENT_ID || !window.google?.accounts?.id) return;
  if (!gsiInitialized) {
    gsiInitialized = true;
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => activeCallback?.(response.credential),
      ux_mode: "popup",
    });
  }
  if (activeMount) {
    activeMount.replaceChildren();
    window.google.accounts.id.renderButton(activeMount, BUTTON_OPTIONS);
  }
};

export function GoogleButton() {
  const { googleLogin } = useAuth();
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleCredential = useCallback(
    async (credential: string) => {
      setPhase("waiting");
      setError(null);
      try {
        const { isNew } = await googleLogin(credential);
        setPhase(isNew ? "creating" : "logging");
        await new Promise((resolve) => setTimeout(resolve, 900));
        router.push("/");
        router.refresh();
      } catch (err) {
        setPhase("idle");
        setError(getErrorMessage(err));
      }
    },
    [googleLogin, router],
  );

  useEffect(() => {
    if (!CLIENT_ID) return;
    const mount = mountRef.current;
    activeCallback = handleCredential;
    activeMount = mount;

    if (window.google?.accounts?.id) {
      ensureGsi();
    } else if (!scriptInjected) {
      scriptInjected = true;
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = ensureGsi;
      document.head.appendChild(script);
    }

    return () => {
      if (activeCallback === handleCredential) activeCallback = null;
      if (activeMount === mount) activeMount = null;
    };
  }, [handleCredential]);

  if (!CLIENT_ID) return null;

  return (
    <div className="space-y-4">
      <div ref={mountRef} className="flex justify-center" />
      {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-ink-700" aria-hidden />
        <span className="text-xs uppercase tracking-wider text-paper-faint">or continue with email</span>
        <span className="h-px flex-1 bg-ink-700" aria-hidden />
      </div>

      {phase !== "idle" && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-ink-950/90 backdrop-blur-sm"
        >
          <Loader />
          <p className="text-sm font-medium text-paper">
            {phase === "waiting"
              ? "Signing you in with Google…"
              : phase === "creating"
                ? "Creating your account…"
                : "Logging you in…"}
          </p>
        </div>
      )}
    </div>
  );
}
