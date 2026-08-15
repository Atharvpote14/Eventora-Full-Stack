"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/admin";
import { Table, Td, Th } from "@/components/dashboard/Table";
import { PaymentStatusBadge } from "@/components/dashboard/StatusBadges";
import { EmptyState } from "@/components/ui/Section";
import { Loader } from "@/components/Loader";
import { getErrorMessage } from "@/lib/api";
import { cn, formatDateTime, formatINR } from "@/lib/utils";

const STATUS_FILTERS = ["", "created", "pending", "successful", "failed", "refunded"];

export function PaymentsTab() {
  const [payments, setPayments] = useState<Awaited<ReturnType<typeof adminService.payments>>["data"]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await adminService.payments(1, 50, filter || undefined);
        if (!cancelled) setPayments(res.data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="no-scrollbar flex gap-1 overflow-x-auto">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === status ? "bg-ink-800 text-paper" : "text-paper-dim hover:text-paper",
            )}
          >
            {status === "" ? "All" : status}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-md border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Loader />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState title="No payments match this filter" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Order ID</Th>
              <Th>Payment ID</Th>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
              <Th>Method</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id} className="border-t border-ink-800">
                <Td className="font-mono text-xs text-paper">{payment.razorpayOrderId}</Td>
                <Td className="font-mono text-xs text-paper-faint">
                  {payment.razorpayPaymentId || "—"}
                </Td>
                <Td className="text-right font-semibold text-paper">
                  {formatINR(payment.amount)}
                </Td>
                <Td>
                  <PaymentStatusBadge status={payment.status} />
                </Td>
                <Td className="text-paper">{payment.method || "—"}</Td>
                <Td className="text-xs text-paper-faint">{formatDateTime(payment.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}