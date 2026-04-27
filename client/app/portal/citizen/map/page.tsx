"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
const IssueMap = dynamic(() => import("@/components/maps/IssueMap").then(mod => mod.IssueMap), { ssr: false });
import { http } from "@/services/http";
import { Card } from "@/components/ui/Card";
import { MapPinned } from "lucide-react";

type IssueItem = {
  _id: string;
  title: string;
  category: string;
  status: string;
  location?: { coordinates?: [number, number] };
  latitude?: number;
  longitude?: number;
  upvoteCount: number;
  createdAt: string;
};

export default function CitizenMapPage() {
  const [items, setItems] = useState<IssueItem[]>([]);
  const center = useMemo<[number, number]>(() => [12.9716, 77.5946], []); // default: Bengaluru

  useEffect(() => {
    http.get("/api/issues?limit=2000").then((r) => setItems(r.data.items || []));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
          <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue/15 to-brand-teal/10">
            <MapPinned className="size-4" />
          </span>
          City Map View
        </div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Explore civic issues with live locations and statuses.
        </div>
      </div>
      <Card className="p-4">
        <IssueMap items={items} center={center} />
      </Card>
    </div>
  );
}

