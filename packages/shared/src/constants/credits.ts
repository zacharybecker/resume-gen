import type { CreditPack } from "../types/payment.js";

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 5,
    price: 499,
    pricePerCredit: 100,
  },
  {
    id: "popular",
    name: "Popular",
    credits: 15,
    price: 1199,
    pricePerCredit: 80,
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 50,
    price: 3499,
    pricePerCredit: 70,
  },
];

export const FREE_CREDITS = 3;
