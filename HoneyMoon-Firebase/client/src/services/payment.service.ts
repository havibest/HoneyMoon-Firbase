class PaymentService {

  async createPayment() {
    throw new Error("Not implemented");
  }

  async startNestLinkPayment() {
    throw new Error("Not implemented");
  }

  async startIntaSendPayment() {
    throw new Error("Not implemented");
  }

  async verifyPayment() {
    throw new Error("Not implemented");
  }

  async completePayment() {
    throw new Error("Not implemented");
  }

  async cancelPayment() {
    throw new Error("Not implemented");
  }

  async getPayment() {
    throw new Error("Not implemented");
  }

  async getPayments() {
    throw new Error("Not implemented");
  }

  getPaymentProvider(country: string) {

    if (
      country.trim().toLowerCase() === "kenya"
    ) {
      return "nestlink";
    }

    return "intasend";
  }

}

export const paymentService =
  new PaymentService();