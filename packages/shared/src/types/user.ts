export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  credits: number;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCredits {
  credits: number;
  lastUpdated: Date;
}
