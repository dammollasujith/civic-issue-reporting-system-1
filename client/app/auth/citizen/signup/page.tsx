"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { http } from "@/services/http";
import { UserPlus } from "lucide-react";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional()
});
type FormValues = z.infer<typeof schema>;

export default function CitizenSignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    await http.post("/api/auth/signup", { ...values, role: "citizen" });
    router.push("/portal");
  }

  return (
    <Card className="p-8">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-teal/10">
        <UserPlus className="size-6 text-slate-900 dark:text-slate-100" />
      </div>
      <div className="mt-5 text-center text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        CREATE ACCOUNT
      </div>
      <div className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
        Start reporting issues with evidence and manual location.
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Name</div>
          <Input placeholder="Your name" {...register("name")} />
          {errors.name && <div className="mt-1 text-xs text-red-600">{errors.name.message}</div>}
        </div>
        <div>
          <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Email</div>
          <Input placeholder="Enter your email" type="email" {...register("email")} />
          {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email.message}</div>}
        </div>
        <div>
          <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Password</div>
          <Input placeholder="Minimum 8 characters" type="password" {...register("password")} />
          {errors.password && <div className="mt-1 text-xs text-red-600">{errors.password.message}</div>}
        </div>
        <div>
          <div className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300">Phone (optional)</div>
          <Input placeholder="+91 ..." {...register("phone")} />
        </div>

        <Button disabled={isSubmitting} type="submit" className="w-full">
          {isSubmitting ? "Creating..." : "Create account"}
        </Button>
      </form>

      <div className="mt-5 text-center text-xs text-slate-600 dark:text-slate-300">
        Already have an account?{" "}
        <Link className="font-semibold text-brand-blue hover:underline" href="/auth/citizen/login">
          Sign in
        </Link>
      </div>
    </Card>
  );
}

