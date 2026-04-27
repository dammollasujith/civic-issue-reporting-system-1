"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { http } from "@/services/http";
import dynamic from "next/dynamic";
const IssueMap = dynamic(() => import("@/components/maps/IssueMap").then(mod => mod.IssueMap), { ssr: false });
import { MapPinned } from "lucide-react";

export default function AdminMapPage() {
  const [items, setItems] = useState<any[]>([]);
  const center = useMemo<[number, number]>(() => [12.9716, 77.5946], []);

  useEffect(() => {
    http.get("/api/issues?limit=5000").then((r) => setItems(r.data.items || []));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
          <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-brand-purple/15 to-brand-blue/10">
            <MapPinned className="size-4" />
          </span>
          Admin Map View
        </div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Monitor complaints across the city.</div>
      </div>
      <Card className="p-4">
        <IssueMap items={items} center={center} />
      </Card>
    </div>
  );
}
