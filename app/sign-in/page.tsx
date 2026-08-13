import type { Metadata } from "next";
import { SignInCard } from "@/components/auth/sign-in-card";
import { SystemStatus } from "@/components/auth/system-status";

export const metadata: Metadata = {
  title: "Sign In | MIGR8 AI",
  description: "Sign in to MIGR8 AI to access your migration projects.",
};

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 text-on-background antialiased md:p-8">
      {/* Decorative background — matches Stitch Sign In */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute -top-[400px] -right-[400px] h-[800px] w-[800px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-[300px] -left-[300px] h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 w-full max-w-md">
        <SignInCard />
        <SystemStatus />
      </main>
    </div>
  );
}
