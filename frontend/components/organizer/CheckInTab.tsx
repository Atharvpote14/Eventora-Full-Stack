"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, QrCode, ScanLine, XCircle } from "lucide-react";
import { checkinService } from "@/services/checkin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/api";
import { cn, formatDateTime } from "@/lib/utils";
import type { VerifyResult } from "@/types";

export function CheckInTab() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [history, setHistory] = useState<VerifyResult[]>([]);

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    const value = ticketNumber.trim();
    if (!value) return;
    setVerifying(true);
    setError(null);
    try {
      const res = await checkinService.verify(value);
      setResult(res);
      setHistory((prev) => [res, ...prev].slice(0, 10));
      setTicketNumber("");
    } catch (err) {
      setResult(null);
      setError(getErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border border-ink-800 bg-ink-850 p-5">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-paper">
          <QrCode className="h-4 w-4 text-ember-400" aria-hidden />
          Check in a ticket
        </h2>
        <p className="mb-4 text-sm text-paper-dim">
          Enter the ticket number from a guest&apos;s ticket or QR code. Check-in is
          permanent.
        </p>

        <form onSubmit={verify} className="space-y-3">
          <Input
            label="Ticket number or QR payload"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="e.g. T-4F9A2B7C or the QR value"
            autoFocus
          />
          <Button type="submit" loading={verifying} className="w-full">
            <ScanLine className="h-4 w-4" aria-hidden /> Verify &amp; check in
          </Button>
        </form>

        {error && (
          <div
            className={cn(
              "mt-4 flex items-start gap-3 rounded-md border border-red-300 bg-red-100 p-3.5 text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
            )}
          >
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-md border border-moss-500/25 bg-moss-500/10 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-moss-500" aria-hidden />
              <p className="text-sm font-semibold text-moss-500">Check-in successful</p>
            </div>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-paper-faint">Ticket</dt>
                <dd className="font-mono text-paper">{result.ticketNumber}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-paper-faint">Event</dt>
                <dd className="text-right text-paper">{result.eventTitle}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-paper-faint">Type</dt>
                <dd className="text-paper">{result.ticketType}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-paper-faint">Attendee</dt>
                <dd className="text-paper">{result.attendee ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-paper-faint">Checked in</dt>
                <dd className="text-paper">{formatDateTime(result.checkedInAt)}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-ink-800 bg-ink-850 p-5">
        <h2 className="mb-4 text-base font-semibold text-paper">Recent check-ins</h2>
        {history.length === 0 ? (
          <p className="text-sm text-paper-faint">No check-ins in this session yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={`${item.ticketNumber}-${item.checkedInAt}`}
                className="flex items-center justify-between gap-3 rounded-md border border-ink-700 bg-ink-900 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-paper">
                    {item.attendee ?? "—"}
                  </p>
                  <p className="truncate text-xs text-paper-faint">
                    {item.eventTitle} · {item.ticketType}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-paper-dim">
                  {item.ticketNumber}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}