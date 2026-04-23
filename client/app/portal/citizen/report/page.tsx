"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import dynamic from "next/dynamic";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

const LocationPickerMap = dynamic(() => import("@/components/maps/LocationPickerMap"), {
  ssr: false,
});
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { http } from "@/services/http";
import { AlertTriangle, MapPin, Timer } from "lucide-react";
import { FileUpload } from "@/components/ui/FileUpload";

const numeric = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => !Number.isNaN(Number(v)), `${label} must be a number`);

const schema = z.object({
  title: z.string().trim().min(4, "Title must be at least 4 characters"),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  category: z.enum([
    "roads",
    "garbage",
    "water_leakage",
    "drainage",
    "streetlight",
    "traffic_signal",
    "illegal_parking",
    "sanitation",
    "public_safety",
    "others"
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  address: z.string().trim().min(3, "Address is required"),
  landmark: z.string().optional(),
  ward: z.string().optional(),
  latitude: numeric("Latitude").refine((v) => {
    const n = Number(v);
    return n >= -90 && n <= 90;
  }, "Latitude must be between -90 and 90"),
  longitude: numeric("Longitude").refine((v) => {
    const n = Number(v);
    return n >= -180 && n <= 180;
  }, "Longitude must be between -180 and 180"),
  isAnonymous: z.boolean().optional()
});

type FormValues = z.infer<typeof schema>;

export default function CitizenReportIssuePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [done, setDone] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting, errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "roads",
      severity: "medium",
      isAnonymous: false,
      latitude: "",
      longitude: ""
    }
  });

  const watchedAddress = useWatch({ control, name: "address" });
  const watchedLandmark = useWatch({ control, name: "landmark" });

  // Geocoding logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      const query = [watchedAddress, watchedLandmark].filter(Boolean).join(", ");
      if (query.length > 5) {
        setIsSearching(true);
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
          if (res.data && res.data.length > 0) {
            const { lat, lon } = res.data[0];
            const latNum = parseFloat(lat);
            const lonNum = parseFloat(lon);
            setMapPosition([latNum, lonNum]);
            setValue("latitude", latNum.toFixed(6));
            setValue("longitude", lonNum.toFixed(6));
          }
        } catch (err) {
          console.error("Geocoding error:", err);
        } finally {
          setIsSearching(false);
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [watchedAddress, watchedLandmark, setValue]);

  async function onSubmit(values: FormValues) {
    setDone(null);
    setSubmitError(null);
    const lat = Number(values.latitude);
    const lng = Number(values.longitude);

    const fd = new FormData();
    fd.append("title", values.title);
    fd.append("description", values.description);
    fd.append("category", values.category);
    fd.append("severity", values.severity);
    fd.append("latitude", String(lat));
    fd.append("longitude", String(lng));
    fd.append("address", values.address);
    if (values.landmark) fd.append("landmark", values.landmark);
    if (values.ward) fd.append("ward", values.ward);
    fd.append("isAnonymous", String(Boolean(values.isAnonymous)));
    for (const f of files) fd.append("media", f);

    try {
      const res = await http.post("/api/issues", fd);
      setDone(res.data.issue?._id || "Submitted");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        e?.message ||
        "Failed to submit issue";
      setSubmitError(String(msg));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
          <AlertTriangle className="size-7 text-orange-500" /> Report an Issue
        </div>
        <div className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          Add evidence, manual location, and severity for faster resolution.
        </div>
      </div>

      <div>
        <Card className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <div className="mb-3 text-sm font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-300">Basic Details</div>
                <div className="grid gap-4">
                  <div>
                    <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Issue Title</div>
                    <Input placeholder="e.g., Pothole near main road" {...register("title")} />
                    {errors.title && <div className="mt-1 text-xs text-red-600">{errors.title.message}</div>}
                  </div>

                  <div>
                    <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Detailed Description</div>
                    <textarea
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none ring-brand-blue/20 shadow-sm transition placeholder:text-slate-400 focus:ring-4 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500"
                      rows={4}
                      placeholder="Describe the issue clearly..."
                      {...register("description")}
                    />
                    {errors.description && <div className="mt-1 text-xs text-red-600">{errors.description.message}</div>}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Category</div>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none ring-brand-blue/20 shadow-sm transition focus:ring-4 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-100"
                    {...register("category")}
                  >
                    <option value="roads">Roads</option>
                    <option value="garbage">Garbage</option>
                    <option value="water_leakage">Water Leakage</option>
                    <option value="drainage">Drainage</option>
                    <option value="streetlight">Streetlight</option>
                    <option value="traffic_signal">Traffic Signal</option>
                    <option value="illegal_parking">Illegal Parking</option>
                    <option value="sanitation">Sanitation</option>
                    <option value="public_safety">Public Safety</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div>
                  <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Impact Severity</div>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none ring-brand-blue/20 shadow-sm transition focus:ring-4 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-100"
                    {...register("severity")}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="mb-3 text-sm font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-300">Location Details</div>
                    <div className="grid gap-4">
                      <div>
                        <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Address / Street</div>
                        <Input placeholder="Enter street or locality..." {...register("address")} />
                        {errors.address && <div className="mt-1 text-xs text-red-600">{errors.address.message}</div>}
                      </div>
                      <div>
                        <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Landmark / Area</div>
                        <Input placeholder="Nearby landmark..." {...register("landmark")} />
                      </div>
                      <div>
                        <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Ward (optional)</div>
                        <Input placeholder="Ward number/name" {...register("ward")} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-end pt-2">
                    <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-black text-slate-700 shadow-sm cursor-pointer transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-300">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" {...register("isAnonymous")} />
                      Report anonymously
                    </label>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-blue-500" /> Verify on Map
                      {isSearching && <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-blue-600 animate-pulse"><Timer className="size-3" /> Searching...</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">Map animates as you type</div>
                  </div>

                  <LocationPickerMap
                    initialCenter={[12.9716, 77.5946]}
                    position={mapPosition}
                    onLocationSelect={(lat, lng) => {
                      setValue("latitude", lat.toFixed(6));
                      setValue("longitude", lng.toFixed(6));
                      setMapPosition([lat, lng]);
                    }}
                  />
                  {(errors.latitude || errors.longitude) && (
                    <div className="mt-2 text-xs text-red-600 font-medium italic">
                      * Please verify the location on the map.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-300">Visual Evidence</div>
                <FileUpload files={files} onFilesChange={setFiles} />
              </div>
            </div>

            <Button disabled={isSubmitting} type="submit" className="w-full py-6 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]">
              {isSubmitting ? "Submitting Request..." : "Submit Civic Issue"}
            </Button>

            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {done && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                Issue submitted successfully! Complaint ID: <span className="font-mono font-bold">{done}</span>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}


