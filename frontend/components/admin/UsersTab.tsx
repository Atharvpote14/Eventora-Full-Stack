"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, UserRoundCheck, UserRoundX } from "lucide-react";
import { adminService } from "@/services/admin";
import { Table, Td, Th } from "@/components/dashboard/Table";
import { Badge } from "@/components/ui/Badge";
import { getErrorMessage } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import type { AdminUser, Role } from "@/types";

const ROLE_OPTIONS: Role[] = ["user", "organizer", "admin"];

export function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.users(1, 50, search || undefined, roleFilter || undefined);
      setUsers(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await adminService.users(1, 50, search || undefined, roleFilter || undefined);
        if (!cancelled) setUsers(res.data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search, roleFilter]);

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-faint"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="h-11 w-full rounded-md border border-ink-700 bg-ink-900 pl-9 pr-3 text-sm text-paper placeholder:text-paper-faint focus:border-ember-600 focus:outline-none"
          />
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {["", ...ROLE_OPTIONS].map((role) => (
            <button
              key={role || "all"}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                roleFilter === role ? "bg-ink-800 text-paper" : "text-paper-dim hover:text-paper",
              )}
            >
              {role === "" ? "All roles" : role}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-lg" />
          ))}
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-ink-800">
                <Td>
                  <p className="font-medium text-paper">{user.name}</p>
                  <p className="text-xs text-paper-faint">{user.email}</p>
                </Td>
                <Td>
                  <select
                    value={user.role}
                    disabled={busyId === user._id}
                    onChange={(e) =>
                      void runAction(user._id, () =>
                        adminService.updateUserRole(user._id, e.target.value as Role),
                      )
                    }
                    className="h-9 rounded-md border border-ink-700 bg-ink-900 px-2 text-sm text-paper focus:border-ember-600 focus:outline-none disabled:opacity-60"
                    aria-label={`Role for ${user.name}`}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <Badge variant={user.isActive ? "success" : "danger"}>
                    {user.isActive ? "Active" : "Suspended"}
                  </Badge>
                  {!user.isVerified && (
                    <Badge variant="neutral" className="ml-1.5">
                      Unverified
                    </Badge>
                  )}
                </Td>
                <Td className="text-xs text-paper-faint">{formatDate(user.createdAt)}</Td>
                <Td className="text-right">
                  <button
                    type="button"
                    disabled={busyId === user._id}
                    onClick={() =>
                      void runAction(user._id, () =>
                        adminService.updateUserStatus(user._id, !user.isActive),
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
                      user.isActive
                        ? "border-red-300 text-red-600 hover:bg-red-100 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                        : "border-moss-500/25 text-moss-500 hover:bg-moss-500/10",
                    )}
                  >
                    {user.isActive ? (
                      <UserRoundX className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <UserRoundCheck className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {user.isActive ? "Suspend" : "Activate"}
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}