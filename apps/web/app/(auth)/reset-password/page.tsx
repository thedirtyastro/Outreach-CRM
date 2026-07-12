"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Zap, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormInput = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted/50" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema) as never,
  });

  async function onSubmit(data: FormInput) {
    if (!token) {
      toast.error("Missing reset token. Please request a new link.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to reset password. The link may have expired.");
        return;
      }

      setDone(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
          <Zap className="w-6 h-6 text-destructive" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Invalid link</h1>
        <p className="text-sm text-muted-foreground">
          This reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full">Request a new link</Button>
        </Link>
      </motion.div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Password updated</h1>
          <p className="text-sm text-muted-foreground">
            Your password has been reset successfully.
          </p>
        </div>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Sign in with new password
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Logo */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">
          Make it at least 8 characters
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                autoComplete="new-password"
                autoFocus
                disabled={isLoading}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                autoComplete="new-password"
                disabled={isLoading}
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </div>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    </motion.div>
  );
}
