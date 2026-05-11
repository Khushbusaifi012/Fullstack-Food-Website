import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Pizza,
  UserRound,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await signup(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="flex min-h-screen font-sans">
      <div className="relative hidden flex-1 flex-col justify-between bg-gradient-to-br from-amber-400 via-orange-500 to-brand p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Pizza className="h-6 w-6" strokeWidth={2.25} />
          </span>
          <span className="text-2xl font-bold tracking-tight">foodislice</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Create your account — it&apos;s quick and free.
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Track orders, reorder favourites, and pay securely from one place.
          </p>
        </div>
        <p className="text-sm text-white/70">
          Demo app — no real server; passwords are not stored.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-surface px-4 py-10">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Pizza className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="text-xl font-bold text-brand">foodislice</span>
        </div>

        <div className="w-full max-w-md rounded-[1.25rem] bg-panel p-8 shadow-soft ring-1 ring-black/[0.06] dark:ring-white/10">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Sign up</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Fill in your details to get started.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
            {error ? (
              <p
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div>
              <label
                htmlFor="signup-name"
                className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Full name
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  className="h-12 w-full rounded-2xl border border-black/10 bg-surface pl-10 pr-4 text-sm text-neutral-900 outline-none ring-brand/30 transition focus:border-brand/40 focus:ring-2 dark:border-white/10 dark:text-neutral-100"
                  placeholder="David Brown"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className="h-12 w-full rounded-2xl border border-black/10 bg-surface pl-10 pr-4 text-sm text-neutral-900 outline-none ring-brand/30 transition focus:border-brand/40 focus:ring-2 dark:border-white/10 dark:text-neutral-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="h-12 w-full rounded-2xl border border-black/10 bg-surface pl-10 pr-12 text-sm text-neutral-900 outline-none ring-brand/30 transition focus:border-brand/40 focus:ring-2 dark:border-white/10 dark:text-neutral-100"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-500 outline-none ring-brand/40 hover:bg-black/[0.04] hover:text-neutral-800 focus-visible:ring-2 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-confirm"
                className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="signup-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(ev) => setConfirm(ev.target.value)}
                  className="h-12 w-full rounded-2xl border border-black/10 bg-surface pl-10 pr-12 text-sm text-neutral-900 outline-none ring-brand/30 transition focus:border-brand/40 focus:ring-2 dark:border-white/10 dark:text-neutral-100"
                  placeholder="Repeat password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-500 outline-none ring-brand/40 hover:bg-black/[0.04] hover:text-neutral-800 focus-visible:ring-2 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={
                    showConfirm ? "Hide confirm password" : "Show confirm password"
                  }
                  aria-pressed={showConfirm}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand/95"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{" "}
            <Link
              to="/login"
              state={{ from: "/menu" }}
              className="font-semibold text-brand hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
