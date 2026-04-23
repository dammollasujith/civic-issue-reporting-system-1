"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { http } from "@/services/http";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, PieChartIcon, TrendingUp } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [trends, setTrends] = useState<any>(null);

  useEffect(() => {
    http.get("/api/admin/trends").then((r) => setTrends(r.data));
  }, []);

  const categoryData = useMemo(() => {
    return (trends?.byCategory || []).map((x: any, i: number) => ({
      issue: String(x._id || "unknown").replaceAll("_", " ").toUpperCase(),
      count: x.count,
      color: ['#0ea5e9', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#14b8a6'][i % 6] // Vibrant analytics colors
    }));
  }, [trends]);

  const statusColors: Record<string, string> = {
    "pending": "#f43f5e", // Radiant Rose
    "in progress": "#8b5cf6", // Deep Purple
    "resolved": "#10b981", // Vibrant Emerald
    "rejected": "#94a3b8", // Muted Slate
    "reviewed": "#0ea5e9", // Vivid Cerulean
    "assigned": "#f59e0b", // Sunset Amber
  };

  const statusData = useMemo(() => {
    return (trends?.byStatus || []).map((x: any) => {
      const name = String(x._id || "unknown").replaceAll("_", " ");
      return {
        name,
        value: x.count,
        color: statusColors[name] || "#f1f5f9"
      };
    });
  }, [trends]);

  const dailyData = useMemo(() => {
    return (trends?.dailyStats || []).map((x: any) => {
      const d = new Date(x.date);
      return { 
        name: d.toLocaleString('default', { month: 'short', day: 'numeric' }), 
        reported: x.reported,
        resolved: x.resolved
      };
    });
  }, [trends]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
          <BarChart3 className="size-7 text-blue-600" /> Administrative Analytics
        </div>
        <div className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Comprehensive overview of system trends and performance.</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 bg-white/70 dark:bg-slate-950/60 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-tighter">
            <BarChart3 className="size-4" /> Issue Count by Category
          </div>
          <div className="mt-8 h-80">
            {categoryData.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-slate-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <XAxis dataKey="issue" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} label={{ value: 'No. of Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b', fontSize: 12, fontWeight: 700 } }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                    {categoryData.map((e: any, i: number) => (
                      <Cell key={`cell-${i}`} fill={e.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-white/70 dark:bg-slate-950/60 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-tighter">
            <PieChartIcon className="size-4" /> Status Breakdown
          </div>
          <div className="mt-8 h-80">
            {statusData.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-slate-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={80} outerRadius={120} stroke="#fff" strokeWidth={4} paddingAngle={5}>
                    {statusData.map((e: any, i: number) => (
                      <Cell key={`cell-${i}`} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {statusData.map((s: any) => (
              <div key={s.name} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="size-3 rounded-md" style={{ background: s.color }} />
                <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">{s.name}</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2 bg-white/70 dark:bg-slate-950/60 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
            <TrendingUp className="size-4" /> Reporting vs Resolution Trends (Last 30 Days)
          </div>
          <div className="mt-8 h-96">
            {dailyData.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-slate-500">No activity data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area 
                    type="monotone" 
                    name="Issues Reported"
                    dataKey="reported" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorReported)" 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                  <Area 
                    type="monotone" 
                    name="Issues Resolved"
                    dataKey="resolved" 
                    stroke="#22c55e" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorResolved)" 
                    dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                  <Legend verticalAlign="bottom" height={36} content={(props) => {
                    const { payload } = props;
                    return (
                      <div className="flex justify-center gap-8 mt-6">
                        {payload?.map((entry: any, index: number) => (
                          <div key={`item-${index}`} className="flex items-center gap-2">
                            <div className="w-8 h-4 rounded border-2" style={{ backgroundColor: entry.color + '20', borderColor: entry.color }} />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-slate-50/50 backdrop-blur-xl border-dashed border-2 border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800/60">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-[#10b981] shadow-sm" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Resolved → Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-md bg-[#f43f5e] shadow-sm" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Pending → Action Required</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

