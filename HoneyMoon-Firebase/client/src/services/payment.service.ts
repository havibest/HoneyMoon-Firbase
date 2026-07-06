// HONEYMOON — Payment Gateway Service
// Integrates IntaSend (card) and NestLink (M-Pesa for Kenya)
// ============================================================

/**
 * IntaSend Payment Gateway
 * For card payments (Visa, MasterCard) - works globally
 * Publishable Key: ISPubKey_live_a920434e-7123-4c26-9e30-6d01cc8befb7
 */
export async function initiateIntaSendPayment(params: {
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  orderId: string;
  description: string;
}): Promise<{ redirectUrl: string; transactionId: string }> {
  // IntaSend API endpoint for initiating payment
  const apiUrl = "https://api.intasend.com/api/v1/payment-initiate/";
  
  const payload = {
    public_key: import.meta.env.VITE_INTASEND_PUBLISHABLE_KEY,
    amount: params.amount,
    currency: params.currency,
    email: params.email,
    first_name: params.firstName,
    last_name: params.lastName,
    phone_number: params.phone,
    host: window.location.origin,
    redirect_url: `${window.location.origin}/checkout?status=success`,
    api_ref: params.orderId,
    comment: params.description,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`IntaSend API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      redirectUrl: data.redirect_url,
      transactionId: data.transaction_id,
    };
  } catch (error) {
    console.error("IntaSend payment initiation failed:", error);
    throw error;
  }
}

/**
 * NestLink M-Pesa Payment Gateway
 * For M-Pesa payments (Kenya only)
 * API Key: ISPubKey_live_a920434e-7123-4c26-9e30-6d01cc8befb7
 * Base URL: https://api.nestlink.co.ke
 */
export async function initiateNestLinkMpesaPayment(params: {
  phone: string; // Format: 2547123456789
  amount: number; // In KES
  orderId: string;
  description: string;
}): Promise<{ confirmationLink: string; checkoutRequestId: string }> {
  const apiUrl = "https://api.nestlink.co.ke/runPrompt";
  const apiSecret = import.meta.env.VITE_NESTLINK_API_KEY || "ISPubKey_live_a920434e-7123-4c26-9e30-6d01cc8befb7";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Secret": apiSecret,
      },
      body: JSON.stringify({
        phone: params.phone,
        amount: params.amount,
        local_id: params.orderId,
        transaction_desc: params.description,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 402) {
        throw new Error("NestLink: Insufficient credits. Please top up your account.");
      }
      throw new Error(`NestLink API error: ${errorData.msg || response.statusText}`);
    }

    const data = await response.json();
    if (!data.status) {
      throw new Error(`NestLink payment failed: ${data.msg}`);
    }

    return {
      confirmationLink: data.data.ConfirmationLink,
      checkoutRequestId: data.data.CheckoutRequestID,
    };
  } catch (error) {
    console.error("NestLink M-Pesa payment initiation failed:", error);
    throw error;
  }
}

/**
 * Track NestLink M-Pesa Transaction Status
 * Poll this endpoint to check payment status
 */
export async function trackNestLinkTransaction(params: {
  orderId: string;
}): Promise<{
  paid: boolean;
  resultCode: number;
  amount?: number;
  refCode?: string;
  phoneNumber?: string;
}> {
  const apiUrl = "https://api.nestlink.co.ke/trackTransaction";
  const apiSecret = import.meta.env.VITE_NESTLINK_API_KEY || "ISPubKey_live_a920434e-7123-4c26-9e30-6d01cc8befb7";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Secret": apiSecret,
      },
      body: JSON.stringify({
        local_id: params.orderId,
      }),
    });

    if (!response.ok) {
      throw new Error(`NestLink tracking error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      paid: data.paid || false,
      resultCode: data.result_code || -1,
      amount: data.result?.amount,
      refCode: data.result?.ref_code,
      phoneNumber: data.result?.phone_number,
    };
  } catch (error) {
    console.error("NestLink transaction tracking failed:", error);
    throw error;
  }
}

/**
 * Verify IntaSend Payment Status
 * Call this after redirect from IntaSend
 */
export async function verifyIntaSendPayment(params: {
  transactionId: string;
}): Promise<{
  status: "success" | "pending" | "failed";
  amount: number;
  currency: string;
  reference: string;
}> {
  const apiUrl = `https://api.intasend.com/api/v1/payment-status/${params.transactionId}/`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_INTASEND_PUBLISHABLE_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`IntaSend verification error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      status: data.status === "COMPLETE" ? "success" : data.status === "PENDING" ? "pending" : "failed",
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
    };
  } catch (error) {
    console.error("IntaSend payment verification failed:", error);
    throw error;
  }
}
