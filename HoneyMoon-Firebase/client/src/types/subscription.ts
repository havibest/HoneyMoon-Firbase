export type SubscriptionStatus =
  | "inactive"
  | "pending"
  | "active"
  | "expired";

export interface Subscription {

  id: string;

  userId: string;

  status: SubscriptionStatus;

  referralChoice: 0 | 1 | 2 | 5;

  amountDue: number;

  activatedAt?: Date;

  expiresAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}