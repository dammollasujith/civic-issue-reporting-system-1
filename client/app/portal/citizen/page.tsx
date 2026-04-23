"use client";

import { useEffect, useMemo, useState } from "react";
import { http } from "@/services/http";
import { Card } from "@/components/ui/Card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { FileText, Clock, Loader, CheckCircle2, XCircle, ArrowUpCircle, Home, BarChart2, Activity } from "lucide-react";

type Issue = { _id: string; status: string; category: string; createdAt: string; upvoteCount: number };

export default function CitizenDashboardPage() {
  const [items, setItems] = useState<Issue[]>([]);

  useEffect(() => {
    http.get("/api/issues/me/list?limit=200").then((r) => setItems(r.data.items || []));
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const byStatus = (s: string) => items.filter((i) => i.status === s).length;
    return {
      total,
      pending: byStatus("pending"),
      inProgress: byStatus("in_progress"),
      resolved: byStatus("resolved"),
      rejected: byStatus("rejected"),
      upvotes: items.reduce((a, b) => a + (b.upvoteCount || 0), 0)
    };
  }, [items]);

  const categoryData = useMemo(() => {
    const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b', '#14b8a6'];
    const m = new Map<string, number>();
    for (const it of items) m.set(it.category, (m.get(it.category) || 0) + 1);
    return Array.from(m.entries()).map(([name, value], index) => {
      const cleanName = name.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return { 
        name: cleanName, 
        value, 
        color: COLORS[index % COLORS.length] 
      };
    }).sort((a, b) => b.value - a.value); // Sorting by value descending looks better for bar charts
  }, [items]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
          <Home className="size-7 text-blue-600" /> Dashboard
        </div>
        <div className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-300">Your reports, status overview, and category distribution.</div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Total Reports", value: stats.total, color: "blue", icon: FileText },
          { label: "Pending", value: stats.pending, color: "red", icon: Clock },
          { label: "In Progress", value: stats.inProgress, color: "orange", icon: Loader },
          { label: "Resolved", value: stats.resolved, color: "green", icon: CheckCircle2 },
          { label: "Rejected", value: stats.rejected, color: "slate", icon: XCircle }
        ].map(({ label, value, color, icon: Icon }) => {
          const colorStyles: Record<string, string> = {
            blue: "border-t-[#3b82f6] text-[#3b82f6] bg-blue-50/60",
            red: "border-t-[#ef4444] text-[#ef4444] bg-red-50/60",
            orange: "border-t-[#f97316] text-[#f97316] bg-orange-50/60",
            green: "border-t-[#22c55e] text-[#22c55e] bg-green-50/60",
            slate: "border-t-[#64748b] text-[#64748b] bg-slate-50/60",
            purple: "border-t-[#a855f7] text-[#a855f7] bg-purple-50/60",
          };
          const style = colorStyles[color] || colorStyles.blue;
          const [borderColor, textColor, bgColor] = style.split(" ");
          
          return (
            <div key={label} className={`rounded-xl border-t-4 ${borderColor} bg-white p-5 shadow-sm dark:bg-slate-950/40 flex items-center gap-4`}>
              <div className={`p-3 rounded-full ${bgColor} ${textColor} dark:bg-opacity-10`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{value ?? "—"}</div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">{label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
            <BarChart2 className="size-4" /> Category Breakdown
          </div>
          <div className="mt-4 h-64">
            {categoryData.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-slate-600 dark:text-slate-300">No reports yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 45 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={40} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    allowDecimals={false} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <Activity className="size-4" /> Recent Activity
          </div>
          <div className="mt-4 space-y-3">
            {items.slice(0, 6).map((it) => (
              <div
                key={it._id}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-950/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold text-slate-950 dark:text-white">
                    {it.category.replaceAll("_", " ")}
                  </div>
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                    {it.status.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                  {new Date(it.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-300">
                Empty state: create your first report from “Report Issue”.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

