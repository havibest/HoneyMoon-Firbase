class SubscriptionService {

  async isSubscriptionActive() {
    throw new Error("Not implemented");
  }

  async getSubscription() {
    throw new Error("Not implemented");
  }

  async selectPlan() {
    throw new Error("Not implemented");
  }

  async activateSubscription() {
    throw new Error("Not implemented");
  }

  async expireSubscription() {
    throw new Error("Not implemented");
  }

  async checkDashboardAccess() {
    throw new Error("Not implemented");
  }

  async getReferralProgress() {
    throw new Error("Not implemented");
  }

  /**
 * Process a referral after successful user registration.
 * This placeholder keeps compatibility with auth.service.ts
 * until the backend referral implementation is completed.
 */
async processReferral(
  referralCode: string,
  userId: string
): Promise<{
  success: boolean;
  referralCode: string;
  userId: string;
}> {
  console.info(
    "[SubscriptionService] Processing referral",
    referralCode,
    userId
  );

  // TODO:
  // Replace this placeholder with an API call when the
  // referral backend endpoint is implemented.

  return {
    success: true,
    referralCode,
    userId,
  };
}

}

export const subscriptionService = new SubscriptionService();

/**
 * Compatibility export.
 * Existing files import:
 *
 * import { processReferral } from "./subscription.service";
 *
 * This wrapper prevents breaking existing code.
 */
export async function processReferral(
  referralCode: string,
  userId: string
) {
  return subscriptionService.processReferral(
    referralCode,
    userId
  );
}