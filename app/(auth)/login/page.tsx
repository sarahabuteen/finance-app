"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    router.push("/");
  }

  return (
    <div className="bg-white rounded-xl p-400">
      <h1 className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900 mb-400">
        Login
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-250">
        <div>
          <label className="block">
            <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-100 block">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              className={`w-full border rounded-lg py-150 px-200 text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] outline-none transition-colors ${
                errors.email
                  ? "border-red focus:border-red focus:ring-1 focus:ring-red"
                  : "border-beige-500 hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900"
              }`}
            />
          </label>
          {errors.email && (
            <p id="login-email-error" role="alert" className="text-[length:var(--text-preset-5)] text-red leading-[var(--text-preset-5--line-height)] mt-50">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block">
            <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-100 block">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                className={`w-full border rounded-lg py-150 px-200 pr-[44px] text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] outline-none transition-colors ${
                  errors.password
                    ? "border-red focus:border-red focus:ring-1 focus:ring-red"
                    : "border-beige-500 hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-200 top-1/2 -translate-y-1/2 rounded p-50 hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900"
              >
                <Image
                  src={showPassword ? "/icon-hide-password.svg" : "/icon-show-password.svg"}
                  alt={showPassword ? "Hide password" : "Show password"}
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </label>
          {errors.password && (
            <p id="login-password-error" role="alert" className="text-[length:var(--text-preset-5)] text-red leading-[var(--text-preset-5--line-height)] mt-50">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-grey-900 text-white rounded-lg py-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] mt-100! hover:bg-grey-500 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors"
        >
          Login
        </button>
      </form>

      <p className="text-center text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] mt-400">
        Need to create an account?{" "}
        <Link href="/signup" className="font-bold text-grey-900 underline rounded hover:text-grey-500 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
