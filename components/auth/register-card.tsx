import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export function RegisterCard() {
  return (
    <div className="flex w-full flex-col gap-6 rounded-card border border-outline-variant bg-surface-container-lowest p-8 shadow-ambient">
      <div className="flex flex-col gap-2 text-center">
        <div className="mb-2 flex justify-center">
          <span className="text-2xl font-bold leading-8 text-primary">MIGR8 AI</span>
        </div>
        <h1 className="text-2xl font-semibold leading-8 text-on-surface">
          Create your account
        </h1>
      </div>

      <RegisterForm />

      <div className="px-6 text-center">
        <p className="text-[13px] leading-[18px] text-on-surface-variant">
          By signing up, you agree to our{" "}
          <Link href="#" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <div className="h-px w-full bg-outline-variant" />

      <div className="text-center">
        <p className="text-sm leading-5 text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
