"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { http } from "@/services/http";
import { ShieldCheck } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      await http.post("/api/auth/login", { ...values, role: "admin" });
      window.location.href = "/portal/admin";
    } catch (e: any) {
      if (!e?.response && String(e?.message || "").toLowerCase().includes("network")) {
        setSubmitError("Cannot reach the server. Make sure the backend is running on http://localhost:4000.");
        return;
      }
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        e?.message ||
        "Login failed";
      setSubmitError(String(msg));
    }
  }

  return (
    <Card className="p-8">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-blue/10">
        <ShieldCheck className="size-6 text-slate-900 dark:text-slate-100" />
      </div>
      <div className="mt-5 text-center text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        ADMIN LOGIN
      </div>
      <div className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
        Please enter your admin credentials.
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Email</div>
          <Input placeholder="Enter your email" type="email" {...register("email")} />
          {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email.message}</div>}
        </div>
        <div>
          <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Password</div>
          <Input placeholder="••••••••" type="password" {...register("password")} />
          {errors.password && <div className="mt-1 text-xs text-red-600">{errors.password.message}</div>}
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-slate-300 text-brand-blue"
            />
            Remember me
          </label>
          <Link className="font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white" href="/auth/forgot-password">
            Forgot password
          </Link>
        </div>

        <Button disabled={isSubmitting} type="submit" className="w-full">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>

        {submitError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {submitError}
          </div>
        )}
      </form>

      <div className="mt-4 text-center text-sm text-slate-600">
        Citizen portal?{" "}
        <Link className="font-medium text-slate-900 hover:underline" href="/auth/citizen/login">
          Citizen Login
        </Link>
      </div>
    </Card>
  );
}

