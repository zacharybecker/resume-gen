import { Link } from "react-router-dom";
import { FREE_CREDITS } from "@resume-gen/shared";
import { useAuth } from "../hooks/useAuth";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 lg:px-8">
        <span className="text-xl font-bold text-dark">
          Resume<span className="text-coral">AI</span>
        </span>
        <Link
          to={user ? "/dashboard" : "/login"}
          className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-dark"
        >
          {user ? "Dashboard" : "Get Started"}
        </Link>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pt-24 text-center lg:pt-32">
        <h1 className="text-5xl font-bold tracking-tight text-dark sm:text-6xl">
          Build your perfect resume
          <br />
          <span className="text-coral">with AI</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Upload your experience, choose a template, and let AI craft a
          professional resume tailored to your target role. Fine-tune with
          conversational editing.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            to={user ? "/dashboard" : "/login"}
            className="rounded-lg bg-coral px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-coral-dark"
          >
            Start for free
          </Link>
          <Link
            to="/pricing"
            className="rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            View pricing
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          {FREE_CREDITS} free credits to get started. No credit card required.
        </p>
      </div>
    </div>
  );
}
