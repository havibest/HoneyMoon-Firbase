

class SubscriptionService {

  async isSubscriptionActive() {
    throw new Error("Not implemented");
  }

  async getSubscription() {
    throw new Error("Not implemented");
  }

  async activateSubscription() {
    throw new Error("Not implemented");
  }

  async expireSubscription() {
    throw new Error("Not implemented");
  }

  async lockDashboard() {
    throw new Error("Not implemented");
  }

  async unlockDashboard() {
    throw new Error("Not implemented");
  }

}

export const subscriptionService = new SubscriptionService();

