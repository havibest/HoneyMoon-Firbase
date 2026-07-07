export type PaymentProvider =
  | "nestlink"
  | "intasend";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired";

export interface Payment {

  id: string;

  userId: string;

  provider: PaymentProvider;

  status: PaymentStatus;

  amount: number;

  currency: string;

  localId: string;

  providerReference?: string;

  phoneNumber?: string;

  country: string;

  referralChoice: 0 | 1 | 2 | 5;

  createdAt: Date;

  updatedAt: Date;

  paidAt?: Date;
}