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
import { env } from "@/lib/env";
import { Landmark } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
type FormValues = z.infer<typeof schema>;

export default function CitizenLoginPage() {
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
      await http.post("/api/auth/login", { ...values, role: "citizen" });
      window.location.href = "/portal/citizen";
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
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-teal/10">
        <Landmark className="size-6 text-slate-900 dark:text-slate-100" />
      </div>
      <div className="mt-5 text-center text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        WELCOME BACK
      </div>
      <div className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
        Welcome back! Please enter your details.
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

        <Button disabled={isSubmitting} type="submit" className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-red-600">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>

        {submitError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {submitError}
          </div>
        )}
      </form>

      <div className="mt-6">
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">Or</div>
        <a
          className="mt-3 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900/50 active:scale-[0.98]"
          href={`${env.apiBaseUrl}/api/auth/google`}
        >
          <svg className="size-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </a>
      </div>

      <div className="mt-5 text-center text-xs text-slate-600 dark:text-slate-300">
        Don&apos;t have an account?{" "}
        <Link className="font-semibold text-brand-blue hover:underline" href="/auth/citizen/signup">
          Sign up for free!
        </Link>
      </div>
    </Card>
  );
}

