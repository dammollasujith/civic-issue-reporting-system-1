"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { http } from "@/services/http";
import { FolderKanban, Hash, Tag, MapPin, AlertCircle, ThumbsUp, Activity } from "lucide-react";

type Issue = {
  _id: string;
  title: string;
  category: string;
  ward?: string;
  severity: string;
  status: string;
  upvoteCount: number;
  createdAt: string;
};

const statuses = ["pending", "reviewed", "assigned", "in_progress", "resolved", "rejected"] as const;

export default function AdminReportsPage() {
  const [items, setItems] = useState<Issue[]>([]);

  useEffect(() => {
    http.get("/api/issues?limit=200").then((r) => setItems(r.data.items || []));
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await http.patch(`/api/issues/${id}/admin`, { status });
    setItems((prev) => prev.map((x) => (x._id === id ? res.data.issue : x)));
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          <FolderKanban className="size-7 text-blue-600" /> Manage Reports
        </div>
        <div className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Review, assign, and resolve complaints.</div>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/35">
              <tr>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5"><Hash className="size-4 text-blue-500" /> Complaint ID</div>
                </th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5"><Tag className="size-4 text-indigo-500" /> Title</div>
                </th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5"><Tag className="size-4 text-purple-500" /> Category</div>
                </th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5"><MapPin className="size-4 text-teal-500" /> Ward</div>
                </th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5"><AlertCircle className="size-4 text-orange-500" /> Severity</div>
                </th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5"><Activity className="size-4 text-rose-500" /> Status</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr
                  key={it._id}
                  className="border-b border-slate-200/70 bg-white/80 hover:bg-slate-50/60 dark:border-slate-800/70 dark:bg-slate-950/25 dark:hover:bg-slate-900/35"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-200">{it._id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{it.title}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{it.category.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{it.ward || "—"}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{it.severity}</td>
                  <td className="px-4 py-3">
                    <select
                      value={it.status}
                      onChange={(e) => updateStatus(it._id, e.target.value)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-semibold outline-none shadow-sm focus:ring-4 transition-colors ${
                        it.status === "pending" ? "border-red-300 text-red-600 bg-red-50/80 focus:ring-red-500/20 dark:border-red-900/50 dark:bg-red-950/20" :
                        it.status === "resolved" ? "border-green-300 text-green-600 bg-green-50/80 focus:ring-green-500/20 dark:border-green-900/50 dark:bg-green-950/20" :
                        it.status === "in_progress" ? "border-orange-300 text-orange-600 bg-orange-50/80 focus:ring-orange-500/20 dark:border-orange-900/50 dark:bg-orange-950/20" :
                        "border-slate-300 text-slate-700 bg-slate-50/80 focus:ring-slate-500/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200"
                      }`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                          {s.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-600" colSpan={7}>
                    No reports yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

