export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
}

export interface Purchase {
  id: string;
  userId: string;
  stripeSessionId: string;
  packId: string;
  credits: number;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

export interface CheckoutRequest {
  packId: string;
}

export interface CheckoutResponse {
  url: string;
}
