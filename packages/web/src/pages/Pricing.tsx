import { CREDIT_PACKS } from "@resume-gen/shared";
import { useCredits } from "../hooks/useCredits";
import { apiPost } from "../lib/api";

export default function Pricing() {
  const { credits } = useCredits();

  const handlePurchase = async (packId: string) => {
    try {
      const { url } = await apiPost<{ url: string }>("/checkout", { packId });
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-dark">Credit Packs</h1>
        <p className="mt-2 text-gray-500">
          You have <span className="font-semibold text-coral">{credits}</span>{" "}
          credits remaining
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {CREDIT_PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`relative rounded-xl border-2 p-6 ${
              pack.popular
                ? "border-coral shadow-lg"
                : "border-gray-200"
            }`}
          >
            {pack.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral px-3 py-0.5 text-xs font-medium text-white">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-bold text-dark">{pack.name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold text-dark">
                ${(pack.price / 100).toFixed(2)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {pack.credits} credits &middot; ${(pack.pricePerCredit / 100).toFixed(2)}/credit
            </p>
            <button
              onClick={() => handlePurchase(pack.id)}
              className={`mt-6 w-full rounded-lg py-2.5 text-sm font-medium transition-colors ${
                pack.popular
                  ? "bg-coral text-white hover:bg-coral-dark"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Buy {pack.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
