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
    | "active"
    | "expired";

  paymentStatus:
    | "pending"
    | "paid"
    | "failed";

  paymentMode:
    | "mpesa"
    | "intasend"
    | "";

  paymentReference: string;

  referralChoice: string;

  referralCode: string;

  referredBy: string;

  referralCount: number;

  createdAt: any;

  updatedAt: any;
}