import type { Metadata } from "next";
import { RegisterCard } from "@/components/auth/register-card";

export const metadata: Metadata = {
  title: "Register | MIGR8 AI",
  description: "Create your MIGR8 AI account to start migration projects.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-on-surface">
      <main className="w-full max-w-[480px]">
        <RegisterCard />
      </main>
    </div>
  );
}
