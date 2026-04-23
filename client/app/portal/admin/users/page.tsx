"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { http } from "@/services/http";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, Users, User as UserIcon, Mail, ShieldCheck, Calendar, MoreHorizontal } from "lucide-react";

type User = { _id: string; name: string; email: string; role: string; isBlocked: boolean; createdAt: string };

export default function AdminUsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const res = await http.get("/api/admin/users?limit=50&q=" + encodeURIComponent(q));
    setItems(res.data.items || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(id: string, isBlocked: boolean) {
    const res = await http.patch(`/api/admin/users/${id}/block`, { isBlocked });
    setItems((prev) => prev.map((u) => (u._id === id ? res.data.user : u)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            <Users className="size-7 text-indigo-500" /> Manage Users
          </div>
          <div className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Search users and block spam accounts.</div>
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name/email..." className="pl-11" />
          </div>
          <Button onClick={load} variant="secondary">
            Search
          </Button>
        </div>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/35">
              <tr>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5"><UserIcon className="size-4 text-blue-500" /> Name</div>
                </th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5"><Mail className="size-4 text-indigo-500" /> Email</div>
                </th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-purple-500" /> Role</div>
                </th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5"><Calendar className="size-4 text-teal-500" /> Created</div>
                </th>
                <th className="px-4 py-4 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5"><MoreHorizontal className="size-4 text-orange-500" /> Action</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-slate-200/70 bg-white/80 hover:bg-slate-50/60 dark:border-slate-800/70 dark:bg-slate-950/25 dark:hover:bg-slate-900/35"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{u.name}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                      u.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => toggle(u._id, !u.isBlocked)} 
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm transition-colors ${
                        u.isBlocked 
                          ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-900/50' 
                          : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50'
                      }`}
                    >
                      {u.isBlocked ? "UNBLOCK" : "BLOCK"}
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-600 dark:text-slate-300" colSpan={5}>
                    No users found.
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

