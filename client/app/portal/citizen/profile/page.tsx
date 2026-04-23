"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { http } from "@/services/http";
import Link from "next/link";
import { 
  IdCard, Trophy, Star, Award, Zap, Shield, Crown, TrendingUp, 
  ThumbsUp, MessageSquare, FileCheck, CheckCircle2, AlertCircle,
  Plus, History, Settings as SettingsIcon, LogOut, Languages, MapPin, Calendar, User
} from "lucide-react";

export default function CitizenProfilePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    Promise.all([
      http.get("/api/users/me"),
      http.get("/api/users/gamification")
    ]).then(([me, gam]) => {
      setForm({
        name: me.data.user.name || "",
        phone: me.data.user.phone || "",
        address: me.data.user.address || ""
      });
      setStats(gam.data.stats);
      setLoading(false);
    });
  }, []);

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  async function save() {
    setLoading(true);
    setMsg(null);
    try {
      await http.patch("/api/users/me", form);
      const gam = await http.get("/api/users/gamification");
      setStats(gam.data.stats);
      setMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.message || err.message || "Failed to save profile" });
    } finally {
      setLoading(false);
    }
  }

  const BadgeIcons: Record<string, any> = {
    Leaf: Trophy,
    Zap: Zap,
    Star: Star,
    Shield: Shield,
    Award: Award
  };

  const CurrentIcon = stats?.currentBadge?.icon ? (BadgeIcons[stats.currentBadge.icon] || Award) : Award;
  
  const progress = stats?.nextBadge 
    ? Math.min(100, Math.round(((stats.totalPoints - stats.currentBadge.minPoints) / (stats.nextBadge.min - stats.currentBadge.minPoints)) * 100))
    : 100;

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-black uppercase tracking-widest">Initialising Profile...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Basic Info & Reputation Header */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="flex-1 p-8 border-none bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-900 dark:to-slate-950 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16" />
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="group relative">
              <div className="size-28 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl dark:border-slate-800 transition-transform group-hover:scale-105 cursor-pointer">
                {stats?.user?.avatarUrl ? (
                  <img src={stats.user.avatarUrl} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                    <User className="size-12 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 grid size-10 place-items-center rounded-2xl bg-white shadow-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <Shield className="size-5 text-blue-600" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-black text-black dark:text-white tracking-tighter">{stats?.user?.name || "Citizen"}</h1>
                {stats?.topCitizenStatus && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase text-amber-900 dark:bg-amber-900/30 dark:text-amber-400">
                    <Crown className="size-3" /> Top Citizen
                  </span>
                )}
              </div>
              <p className="mt-1 text-black dark:text-slate-400 font-bold">{stats?.user?.email}</p>
              <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 rounded-xl bg-blue-100/70 px-3 py-1.5 text-[11px] font-black text-black dark:text-blue-300 uppercase tracking-tight">
                  <MapPin className="size-3.5" /> {stats?.user?.address || "Location not set"}
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-indigo-100/70 px-3 py-1.5 text-[11px] font-black text-black dark:text-indigo-300 uppercase tracking-tight">
                  <Calendar className="size-3.5" /> Joined {new Date(stats?.user?.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:w-96 p-8 border-none bg-gradient-to-br from-blue-50 to-indigo-100 text-black shadow-xl shadow-blue-200/40 relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/10 rounded-full" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <span className="text-sm font-black uppercase tracking-widest text-black/60">Reputation Score</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              Lvl {stats?.currentBadge?.name}
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="grid size-16 place-items-center rounded-2xl bg-white text-blue-600 border-2 border-indigo-100 shadow-sm">
               <CurrentIcon className="size-9" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tighter text-black">{stats?.totalPoints || 0}</span>
                <span className="text-xs font-black uppercase text-black/40">Points ⭐</span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600/70 mt-1">Global Impact Verified</div>
            </div>
          </div>
          <div className="mt-10 space-y-3 relative z-10">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter">
              <span className="text-black/60">Level Progression</span>
              <span className="text-black">{progress}% to {stats?.nextBadge?.name || "Hero"}</span>
            </div>
            <div className="h-4 w-full rounded-full bg-black/5 overflow-hidden border-2 border-indigo-100">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-indigo-700 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Stats Overview */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Reports", value: stats?.statsOverview?.totalIssues, icon: FileCheck, color: "text-blue-700", bg: "bg-blue-100/50" },
          { label: "Resolved", value: stats?.statsOverview?.resolvedIssues, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100/50" },
          { label: "Comments", value: stats?.commentsCount, icon: MessageSquare, color: "text-indigo-700", bg: "bg-indigo-100/50" },
          { label: "Success Rate", value: `${stats?.statsOverview?.successRate}%`, icon: TrendingUp, color: "text-amber-700", bg: "bg-amber-100/50" },
        ].map((s) => (
          <Card key={s.label} className="p-5 flex flex-col items-center text-center gap-3 border-2 border-slate-50 shadow-sm dark:bg-slate-950/40 dark:border-slate-800 transition-transform hover:scale-105">
            <div className={`grid size-14 place-items-center rounded-2xl ${s.bg} dark:bg-opacity-10 shadow-sm`}>
              <s.icon className={`size-7 ${s.color}`} />
            </div>
            <div className="text-2xl font-black text-black dark:text-white leading-tight">{s.value || 0}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* 3. Main Activity (Left 8) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-8 border-none shadow-sm dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <History className="size-6 text-black dark:text-white" />
                <h3 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">Recent Activity</h3>
              </div>
              <Link href="/portal/citizen">
                <Button variant="ghost" className="text-sm font-black border-2 border-slate-100 hover:bg-slate-50 dark:border-slate-800 text-black">VIEW ALL</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.recentIssues?.length > 0 ? (
                stats.recentIssues.map((issue: any) => (
                  <div key={issue.id} className="group flex items-center justify-between p-4 rounded-3xl border border-slate-100 transition-all hover:border-blue-200 hover:bg-blue-50/10 dark:border-slate-800 dark:hover:border-blue-900/50">
                    <div className="flex items-center gap-4">
                      <div className="grid size-12 place-items-center rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                        {issue.status === 'resolved' ? (
                          <CheckCircle2 className="size-6 text-emerald-500" />
                        ) : (
                          <AlertCircle className="size-6 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-black dark:text-white line-clamp-1">{issue.title}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase text-black/40 dark:text-slate-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            issue.status === 'resolved' ? 'border-emerald-200 text-emerald-600' : 'border-blue-200 text-blue-600'
                          }`}>
                            {issue.status.replaceAll('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/portal/citizen?id=${issue.id}`}>
                      <Button variant="ghost" size="sm" className="rounded-xl font-black opacity-0 group-hover:opacity-100 transition-opacity text-black">DETAILS</Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-black/40 font-black uppercase tracking-widest text-sm italic">No reports filed yet. Stay active!</div>
              )}
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <SettingsIcon className="size-6 text-black dark:text-white" />
              <h3 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">Account Settings</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-widest text-black/60 dark:text-white/60">Legal Name</div>
                <Input className="rounded-2xl border-slate-200 h-12 px-5 text-black font-bold" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-widest text-black/60 dark:text-white/60">Phone Number</div>
                <Input className="rounded-2xl border-slate-200 h-12 px-5 text-black font-bold" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <div className="mb-2 text-xs font-black uppercase tracking-widest text-black/60 dark:text-white/60">Residential Address</div>
                <Input className="rounded-2xl border-slate-200 h-12 px-5 text-black font-bold" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button disabled={loading} onClick={save} className="rounded-2xl px-10 h-12 bg-blue-600 hover:bg-blue-700 font-extrabold tracking-tighter shadow-xl shadow-blue-500/20 text-white">
                {loading ? "SYNCING..." : "UPDATE PROFILE"}
              </Button>
              <Button 
                onClick={() => { window.location.href = '/api/auth/logout' }}
                variant="ghost" 
                className="rounded-2xl h-12 px-6 font-black flex items-center gap-2 border-2 border-red-100 text-red-600 hover:bg-red-50 active:scale-95 dark:border-red-900/30 dark:hover:bg-red-950/40"
              >
                <LogOut className="size-4" /> Logout
              </Button>
              {msg && (
                <div className={`ml-auto text-sm font-black ${msg.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>
                  {msg.text.toUpperCase()}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 4. Sidebar (Right 4) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 border-2 border-slate-50 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-black uppercase text-black dark:text-white tracking-tighter mb-6">
              <Award className="size-5 text-amber-600" /> Lifetime Impact
            </div>
            <div className="space-y-5">
              {[
                { label: "Total Reports", value: stats?.statsOverview?.totalIssues, icon: FileCheck, color: "text-blue-700", bg: "bg-blue-100/50", border: "border-blue-100" },
                { label: "Positive Resolution", value: stats?.statsOverview?.resolvedIssues, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100/50", border: "border-emerald-100" },
                { label: "Participation", value: stats?.commentsCount, icon: MessageSquare, color: "text-indigo-700", bg: "bg-indigo-100/50", border: "border-indigo-100" },
              ].map((s) => (
                <div key={s.label} className={`flex items-center justify-between p-4 rounded-3xl border ${s.border} ${s.bg} dark:bg-slate-950/20`}>
                  <div className="flex items-center gap-3">
                    <div className={`grid size-10 place-items-center rounded-xl bg-white shadow-sm dark:bg-slate-800`}>
                      <s.icon className={`size-5 ${s.color}`} />
                    </div>
                    <span className="text-[11px] font-black text-black dark:text-slate-300 uppercase tracking-tight">{s.label}</span>
                  </div>
                  <span className="text-xl font-black text-black dark:text-white">{s.value || 0}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 border-none bg-indigo-50/50 dark:bg-indigo-900/10 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="size-5 text-indigo-700" />
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-200">World Leaderboard</h3>
            </div>
            <div className="space-y-4">
              {stats?.topLeaders?.map((leader: any, idx: number) => (
                <div key={leader.userId} className={`flex items-center justify-between p-4 rounded-3xl bg-white border-2 border-indigo-50 dark:bg-slate-900 dark:border-slate-800 ${idx === 0 ? 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-900' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="size-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner">
                        <User className="size-full p-2 text-slate-400" />
                      </div>
                      <div className={`absolute -top-2 -right-2 size-5 rounded-lg grid place-items-center text-[10px] font-black text-white shadow-sm ${
                        idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-500' : 'bg-orange-500'
                      }`}>
                        {idx + 1}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-black dark:text-white truncate w-24 uppercase tracking-tighter">{leader.user.name}</div>
                      <div className="text-[9px] font-black text-indigo-600 uppercase">PREMIUM CITIZEN</div>
                    </div>
                  </div>
                  <div className="text-sm font-black text-black dark:text-white">{leader.totalPoints} <span className="text-[9px] opacity-60">PTS</span></div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t-2 border-indigo-100 dark:border-slate-800 flex items-center justify-between font-black text-[11px] uppercase tracking-widest text-indigo-600">
              <span>Your Monthly Rank</span>
              <span className="text-xl text-black dark:text-white tracking-tighter">#{stats?.monthlyRank || "--"}</span>
            </div>
          </Card>




        </div>
      </div>
    </div>
  );
}
