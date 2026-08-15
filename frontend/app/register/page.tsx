"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OtpVerification } from "@/components/otp/OtpVerification";
import { getErrorMessage } from "@/lib/api";

export default function RegisterPage() {
  const { user, initialized, register, verifyOtp, resendOtp } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialized && user) {
      router.replace("/");
    }
  }, [initialized, user, router]);

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
      });
      setStep("otp");
      window.scrollTo({ top: 0, behavior: "instant" });
      setNotice(
        "We sent a verification code to your email. Enter it below to activate your account.",
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={step === "form" ? "Create your account" : "Verify your email"}
      subtitle={
        step === "form"
          ? "Join Eventora to book tickets and save events."
          : `We emailed a code to ${email}`
      }
    >
      {notice && (
        <p className="mb-4 rounded-md border border-moss-500/25 bg-moss-500/10 px-3 py-2 text-sm text-moss-500">
          {notice}
        </p>
      )}
      {step === "form" ? (
        <>
          <GoogleButton />
          <form onSubmit={(event) => void submitForm(event)} className="space-y-4" noValidate>
          <Input
            label="Full name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Atharv Pote"
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Optional"
            />
            <Input
              label="City"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Optional"
            />
          </div>
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            helper="Use 8+ characters with a mix of letters and numbers."
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Repeat your password"
          />
          {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            Create account
          </Button>
        </form>
        </>
      ) : (
        <OtpVerification
          onVerify={async (code) => {
            await verifyOtp(email.trim(), code);
            await new Promise((resolve) => setTimeout(resolve, 1100));
            router.push("/login?verified=1");
          }}
          onResend={async () => {
            await resendOtp(email.trim());
          }}
        />
      )}
      <p className="mt-6 text-center text-sm text-paper-dim">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ember-400 hover:text-ember-300">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}