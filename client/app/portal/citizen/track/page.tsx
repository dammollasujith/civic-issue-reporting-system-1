"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { http } from "@/services/http";
import { CheckCircle2, Clock, FileSearch, ShieldAlert, Wrench } from "lucide-react";

const steps = ["pending", "reviewed", "assigned", "in_progress", "resolved"] as const;

function stepIndex(status: string) {
  const idx = steps.indexOf(status as any);
  return idx === -1 ? 0 : idx;
}

function stepMeta(step: string) {
  if (step === "pending") return { label: "Pending", icon: Clock };
  if (step === "reviewed") return { label: "Reviewed", icon: FileSearch };
  if (step === "assigned") return { label: "Assigned", icon: Wrench };
  if (step === "in_progress") return { label: "In Progress", icon: Wrench };
  if (step === "resolved") return { label: "Resolved", icon: CheckCircle2 };
  return { label: step.replaceAll("_", " "), icon: Clock };
}

export default function TrackStatusPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Loading status...</div>}>
      <TrackStatusContent />
    </Suspense>
  );
}

function TrackStatusContent() {
  const sp = useSearchParams();
  const id = sp.get("id") || "";
  const [issue, setIssue] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    http
      .get(`/api/issues/${id}`)
      .then((r) => setIssue(r.data.issue))
      .catch(() => setErr("Issue not found."));
  }, [id]);

  const active = useMemo(() => stepIndex(issue?.status || "pending"), [issue?.status]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
          <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-brand-purple/15 to-brand-blue/10">
            <FileSearch className="size-4" />
          </span>
          Track Status
        </div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          View timeline progress for a Complaint ID.
        </div>
      </div>

      <Card className="p-6">
        {!id && <div className="text-sm text-slate-700 dark:text-slate-200">No complaint ID provided.</div>}
        {err && <div className="text-sm text-red-600">{err}</div>}

        {issue && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-slate-600 dark:text-slate-300">Complaint ID</div>
              <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{issue._id}</div>
              <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{issue.title}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {issue.category?.replaceAll("_", " ")}
              </div>
            </div>

            {issue.status === "rejected" ? (
              <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-800 shadow-sm dark:border-red-900/40 dark:bg-red-950/35 dark:text-red-200">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldAlert className="size-4" /> Rejected
                </div>
                {issue.adminNotes ? (
                  <div className="mt-2 text-xs text-red-700/80 dark:text-red-200/80">{issue.adminNotes}</div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((s, idx) => (
                  <div
                    key={s}
                    className={[
                      "flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm transition",
                      idx <= active
                        ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/25"
                        : "border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/25"
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={[
                          "grid size-9 place-items-center rounded-2xl",
                          idx <= active ? "bg-emerald-500/15" : "bg-slate-500/10"
                        ].join(" ")}
                      >
                        {(() => {
                          const Icon = stepMeta(s).icon;
                          return <Icon className="size-4 text-slate-900 dark:text-slate-100" />;
                        })()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {stepMeta(s).label}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          {idx < active ? "Completed" : idx === active ? "Current step" : "Upcoming"}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {idx <= active ? "✓" : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
