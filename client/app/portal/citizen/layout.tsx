import "leaflet/dist/leaflet.css";
import { Sidebar, citizenNav } from "@/components/portal/Sidebar";

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-4">
        <Sidebar title="Citizen Portal" homeHref="/portal/citizen" items={citizenNav} />
        <main className="min-h-[calc(100vh-2rem)] w-full rounded-3xl border border-slate-200/60 bg-white/70 p-6 text-slate-900 shadow-soft backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/40 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}

