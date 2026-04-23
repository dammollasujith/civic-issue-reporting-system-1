"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { http } from "@/services/http";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FileText, Clock, Loader, CheckCircle2, XCircle, AlertCircle, PlusCircle, Timer, LayoutDashboard, BarChart3, PieChartIcon, Lightbulb } from "lucide-react";

export default function AdminDashboardPage() {
  const [cards, setCards] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);

  useEffect(() => {
    http.get("/api/admin/summary").then((r) => setCards(r.data.cards));
    http.get("/api/admin/trends").then((r) => setTrends(r.data));
  }, []);

  const monthData = useMemo(() => {
    const raw = trends?.byMonth || [];
    return raw.map((x: any) => {
      const d = new Date(x._id.y, x._id.m - 1);
      return {
        month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        "No. of Issues": x.count
      };
    });
  }, [trends]);

  const statusData = useMemo(() => {
    return [
      { name: "Pending", value: Number(cards?.pending || 0), color: "#A855F7" },
      { name: "In Progress", value: Number(cards?.inProgress || 0), color: "#F97316" },
      { name: "Resolved", value: Number(cards?.resolved || 0), color: "#22C55E" },
      { name: "Rejected", value: Number(cards?.rejected || 0), color: "#EF4444" }
    ].filter((x) => x.value > 0);
  }, [cards]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
          <LayoutDashboard className="size-7 text-blue-600" /> Admin Dashboard
        </div>
        <div className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-300">City-wide overview, trends, and performance.</div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: "Total Issues", value: cards?.totalIssues, color: "blue", icon: FileText },
          { label: "Pending", value: cards?.pending, color: "red", icon: Clock },
          { label: "In Progress", value: cards?.inProgress, color: "orange", icon: Loader },
          { label: "Resolved", value: cards?.resolved, color: "green", icon: CheckCircle2 },
          { label: "Rejected", value: cards?.rejected, color: "slate", icon: XCircle },
          { label: "High Priority", value: cards?.highPriority, color: "orange", icon: AlertCircle },
          { label: "New Today", value: cards?.newToday, color: "blue", icon: PlusCircle },
          {
            label: "Avg Resolution",
            value: cards?.avgResolutionMs ? `${Math.round(cards.avgResolutionMs / (1000 * 60 * 60 * 24))}d` : "—",
            color: "green",
            icon: Timer
          }
        ].map(({ label, value, color, icon: Icon }) => {
          const colorStyles: Record<string, string> = {
            blue: "border-t-[#3b82f6] text-[#3b82f6] bg-blue-50/60",
            red: "border-t-[#ef4444] text-[#ef4444] bg-red-50/60",
            orange: "border-t-[#f97316] text-[#f97316] bg-orange-50/60",
            green: "border-t-[#22c55e] text-[#22c55e] bg-green-50/60",
            slate: "border-t-[#64748b] text-[#64748b] bg-slate-50/60",
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

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
            <BarChart3 className="size-4" /> Monthly Complaints
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} label={{ value: 'No. of Issues', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b', fontSize: 10, fontWeight: 700 } }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="No. of Issues" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
            <PieChartIcon className="size-4" /> Status distribution
          </div>
          <div className="mt-4 h-64">
            {statusData.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-slate-600 dark:text-slate-300">
                No data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
                    {statusData.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            {statusData.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 dark:border-slate-700/70 dark:bg-slate-950/35"
              >
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </div>
                <div className="font-black">{s.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-2 border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-700 dark:text-amber-500">
            <Lightbulb className="size-4" /> Quick Insights
          </div>
          <div className="mt-6 space-y-4 text-sm font-bold text-amber-900 dark:text-amber-100">
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50">
              <span className="text-amber-600 uppercase text-[10px] font-black block mb-1">PRO TIP</span> 
              Use “Manage Reports” to assign specialized departments, add official notes, and track resolution timelines.
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50">
              <span className="text-amber-600 uppercase text-[10px] font-black block mb-1">SYSTEM NOTE</span> 
              Identified <span className="underline decoration-amber-400">High Priority</span> issues are those flagged as 'critical' severity that await resolution.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

