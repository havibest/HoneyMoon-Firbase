export type ReferralStatus =
  | "pending_signup"
  | "email_verified"
  | "subscription_selected"
  | "payment_pending"
  | "payment_completed"
  | "reward_unlocked";

export interface ReferralActivity {

  type: ReferralStatus;

  createdAt: Date;

  performedBy: string;

  metadata?: Record<string, unknown>;
}

export interface Referral {

  id: string;

  referrerId: string;

  referredUserId: string;

  status: ReferralStatus;

  activity: ReferralActivity[];

  createdAt: Date;

  updatedAt: Date;
}