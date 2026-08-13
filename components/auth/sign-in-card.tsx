import Link from "next/link";
import { Suspense } from "react";
import { Migr8Logo } from "@/components/brand/migr8-logo";
import { SignInForm } from "@/components/auth/sign-in-form";

export function SignInCard() {
  return (
    <div className="w-full rounded-2xl border border-outline/20 bg-surface-container-lowest p-8 shadow-ambient">
      <div className="mb-8 text-center">
        <div className="mb-6 inline-flex items-center justify-center rounded-lg bg-primary-container/10">
          <Migr8Logo priority />
        </div>
        <h1 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
          Sign in to MIGR8 AI
        </h1>
        <p className="text-sm leading-5 text-on-surface-variant">
          Enter your credentials to access the migration projects.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-on-surface-variant">Loading…</p>}>
        <SignInForm />
      </Suspense>

      <div className="mt-8 text-center">
        <p className="text-sm leading-5 text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-primary transition-colors hover:text-primary-container"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
