"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { http } from "@/services/http";
import { KeyRound } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  newPassword: z.string().min(8)
});
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";
  const email = sp.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { token, email, newPassword: "" }
  });

  async function onSubmit(values: FormValues) {
    await http.post("/api/auth/reset-password", values);
    router.push("/auth/citizen/login");
  }

  return (
    <Card className="p-8">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-blue/10">
        <KeyRound className="size-6 text-slate-900 dark:text-slate-100" />
      </div>
      <div className="mt-5 text-center text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        RESET PASSWORD
      </div>
      <div className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
        Set a new password for your account.
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Email</div>
          <Input type="email" {...register("email")} />
          {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email.message}</div>}
        </div>
        <div>
          <div className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">Token</div>
          <Input {...register("token")} />
          {errors.token && <div className="mt-1 text-xs text-red-600">{errors.token.message}</div>}
        </div>
        <div>
          <div className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">New password</div>
          <Input type="password" placeholder="Minimum 8 characters" {...register("newPassword")} />
          {errors.newPassword && <div className="mt-1 text-xs text-red-600">{errors.newPassword.message}</div>}
        </div>
        <Button disabled={isSubmitting} type="submit" className="w-full">
          {isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </Card>
  );
}
