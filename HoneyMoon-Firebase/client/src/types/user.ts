export interface UserProfile {
  uid: string;

  email: string;

  displayName: string;

  firstName: string;

  lastName: string;

  country: string;

  city: string;

  bio: string;

  photos: string[];

  interests: string[];

  admin: boolean;

  isAi: boolean;

  verified: boolean;

  active: boolean;

  online: boolean;

  profileCompleted: boolean;

  subscriptionStatus:
  | "inactive"
  | "pending"
  | "active"
  | "expired";

paymentStatus:
  | "unpaid"
  | "pending"
  | "paid"
  | "failed";

paymentMode?:
  | "mpesa"
  | "intasend";

paymentProvider?:
  | "nestlink"
  | "intasend";

paymentReference?: string;

subscriptionStart?: Date;

subscriptionEnd?: Date;

  

  referralChoice: string;

  referralCode: string;

  referredBy: string;

  referralCount: number;

  createdAt: any;

  updatedAt: any;
}