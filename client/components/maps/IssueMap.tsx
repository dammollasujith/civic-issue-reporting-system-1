"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { clsx } from "clsx";
import { LocateFixed } from "lucide-react";
import { ensureLeafletIcons } from "@/components/maps/leafletFix";

type Item = {
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

type StatusKey = "all" | "pending" | "in_progress" | "resolved" | "rejected";

function statusColor(status: string) {
  // Requested:
  // - Green -> Resolved
  // - Orange -> In Progress
  // - Red -> Pending
  // (Rejected shown as gray)
  if (status === "pending") return "#EF4444";
  if (status === "in_progress") return "#F97316";
  if (status === "resolved") return "#22C55E";
  if (status === "rejected") return "#94A3B8";
  return "#64748B";
}

export function IssueMap({
  items,
  center,
  enableLocate = true
}: {
  items: Item[];
  center: [number, number];
  enableLocate?: boolean;
}) {
  useEffect(() => {
    ensureLeafletIcons();
  }, []);

  const [active, setActive] = useState<StatusKey>("all");
  const [map, setMap] = useState<L.Map | null>(null);
  const [locating, setLocating] = useState(false);

  function markerIcon(status: string) {
    const c = statusColor(status);
    return L.divIcon({
      className: "",
      html: `
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: ${c};
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow: 0 10px 18px rgba(2,6,23,0.18);
        "></div>
      `
    });
  }

  const normalized = useMemo(() => {
    return items
      .map((it) => {
        const coords = it.location?.coordinates;
        const lat = typeof it.latitude === "number" ? it.latitude : coords ? coords[1] : undefined;
        const lng = typeof it.longitude === "number" ? it.longitude : coords ? coords[0] : undefined;
        if (typeof lat !== "number" || typeof lng !== "number") return null;
        return { ...it, __lat: lat, __lng: lng };
      })
      .filter(Boolean) as Array<Item & { __lat: number; __lng: number }>;
  }, [items]);

  const filtered = useMemo(() => {
    if (active === "all") return normalized;
    return normalized.filter((x) => x.status === active);
  }, [active, normalized]);

  async function locateMe() {
    if (!enableLocate) return;
    if (!navigator.geolocation || !map) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        map.flyTo([p.coords.latitude, p.coords.longitude], 14, { duration: 1.1 });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 9000 }
    );
  }

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950/40">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: 520, width: "100%" }}
        whenCreated={setMap}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filtered.map((it) => {
          return (
            <Marker key={it._id} position={[it.__lat, it.__lng]} icon={markerIcon(it.status)}>
              <Popup>
                <div className="space-y-1">
                  <div className="text-sm font-semibold">{it.title}</div>
                  <div className="text-xs text-slate-600">{it.category.replaceAll("_", " ")}</div>
                  <div className="flex items-center gap-2 text-xs">
                    {it.status.replaceAll("_", " ")}
                  </div>
                  <div className="text-[11px] text-slate-500">{new Date(it.createdAt).toLocaleString()}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-4 left-4 z-50">
        <div className="pointer-events-auto w-[340px] rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-soft backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/80">
          <div className="space-y-2">
            {[
              { label: "Pending", status: "pending" },
              { label: "In Progress", status: "in_progress" },
              { label: "Resolved", status: "resolved" }
            ].map((x) => (
              <div key={x.label} className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                <span className={clsx("size-2 rounded-full")} style={{ background: statusColor(x.status) }} />
                {x.label}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ["All", "all"],
                ["Pending", "pending"],
                ["In Progress", "in_progress"],
                ["Resolved", "resolved"]
              ] as Array<[string, StatusKey]>
            ).map(([label, key]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active === key
                    ? "bg-brand-teal text-white shadow-soft"
                    : "bg-white/80 text-slate-700 shadow-sm hover:bg-white dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-900/45"
                )}
              >
                {label}
              </button>
            ))}

            {enableLocate && (
              <button
                type="button"
                onClick={locateMe}
                disabled={locating}
                className={clsx(
                  "ml-auto inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-soft transition",
                  "bg-gradient-to-r from-brand-blue to-brand-teal text-white",
                  locating && "opacity-70"
                )}
              >
                <LocateFixed className="size-3.5" />
                Civic Issues Near Me
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

