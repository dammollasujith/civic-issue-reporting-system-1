"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { http } from "@/services/http";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ClipboardList, Search } from "lucide-react";

type Issue = {
  _id: string;
  title: string;
  category: string;
  status: string;
  upvoteCount: number;
  createdAt: string;
  address?: string;
};

export default function MyReportsPage() {
  const [items, setItems] = useState<Issue[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    http.get("/api/issues/me/list?limit=200").then((r) => setItems(r.data.items || []));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((i) => `${i.title} ${i.category} ${i.status}`.toLowerCase().includes(query));
  }, [items, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
            <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue/15 to-brand-teal/10">
              <ClipboardList className="size-4" />
            </span>
            My Reports
          </div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Search and track your submitted complaints.</div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title/category/status..."
            className="pl-11"
          />
        </div>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/35">
              <tr>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Complaint ID</th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Title</th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Category</th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Date</th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr
                  key={it._id}
                  className="border-b border-slate-200/70 bg-white/80 hover:bg-slate-50/60 dark:border-slate-800/70 dark:bg-slate-950/25 dark:hover:bg-slate-900/35"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-200">{it._id}</td>
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium text-slate-900 hover:underline dark:text-slate-100"
                      href={`/portal/citizen/track?id=${it._id}`}
                    >
                      {it.title}
                    </Link>
                    {it.address && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{it.address}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{it.category.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{new Date(it.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                      {it.status.replaceAll("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-600 dark:text-slate-300" colSpan={6}>
                    No reports found.
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

