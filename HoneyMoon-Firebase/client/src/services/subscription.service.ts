// HONEYMOON — Subscription & Referral Service
// ============================================================

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  increment,
  writeBatch,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types";

// ─── Subscription ─────────────────────────────────────────────

export async function activateSubscription(uid: string): Promise<void> {
  const batch = writeBatch(db);

  batch.update(doc(db, "users", uid), {
    subscriptionStatus: "active",
    subscriptionActivatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function selectReferralPlan(
  uid: string,
  referralChoice: 0 | 1 | 2 | 5,
  amountDue: number
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    referralChoice,
    amountDue,
    updatedAt: serverTimestamp(),
  });

  // NOTE: For pay-now (0 referrals), activation happens AFTER payment confirmation
  // via activateSubscription() called from the Checkout page on payment success.
  // Do NOT activate here — the user must complete payment first.
}

// ─── Referrals ────────────────────────────────────────────────

export async function processReferral(
  referrerId: string,
  newUserUid: string,
  newUserEmail: string,
  newUserName: string
): Promise<void> {
  // Record referral with status tracking
  await addDoc(collection(db, "referrals"), {
    referrerId,
    referredUid: newUserUid,
    referredEmail: newUserEmail,
    referredName: newUserName,
    status: "pending", // pending → active → paid
    paid: false,
    createdAt: serverTimestamp(),
  });

  // Increment referrer's count
  await updateDoc(doc(db, "users", referrerId), {
    referralCount: increment(1),
    updatedAt: serverTimestamp(),
  });

  // Create notification for referrer
  await addDoc(collection(db, "notifications"), {
    userId: referrerId,
    type: "referral_signup",
    title: "New Referral Signup",
    message: `${newUserName} signed up using your referral link`,
    data: {
      referredUid: newUserUid,
      referredName: newUserName,
      referredEmail: newUserEmail,
    },
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function markReferralActive(referredUid: string): Promise<void> {
  // Mark referral as active (user created account)
  const q = query(
    collection(db, "referrals"),
    where("referredUid", "==", referredUid),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  if (snap.empty) return;

  const referralDoc = snap.docs[0];
  const referralData = referralDoc.data();
  const referrerId = referralData.referrerId;

  await updateDoc(referralDoc.ref, {
    status: "active",
    updatedAt: serverTimestamp(),
  });

  // Notify referrer of activation
  await addDoc(collection(db, "notifications"), {
    userId: referrerId,
    type: "referral_active",
    title: "Referral Account Active",
    message: `${referralData.referredName} has verified their email`,
    data: { referredUid },
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function markReferralPaid(referredUid: string): Promise<void> {
  // Find the referral record
  const q = query(
    collection(db, "referrals"),
    where("referredUid", "==", referredUid),
    where("paid", "==", false)
  );
  const snap = await getDocs(q);
  if (snap.empty) return;

  const referralDoc = snap.docs[0];
  const referralData = referralDoc.data();
  const referrerId = referralData.referrerId;

  // Mark referral as paid
  await updateDoc(referralDoc.ref, {
    paid: true,
    status: "paid",
    paidAt: serverTimestamp(),
  });

  // Get referrer's profile
  const referrerSnap = await getDoc(doc(db, "users", referrerId));
  if (!referrerSnap.exists()) return;

  const referrer = referrerSnap.data() as UserProfile;
  const referralGoal = referrer.referralChoice ?? 0;

  // Count PAID referrals only (not total)
  const paidReferralsQuery = query(
    collection(db, "referrals"),
    where("referrerId", "==", referrerId),
    where("paid", "==", true)
  );
  const paidSnap = await getDocs(paidReferralsQuery);
  const paidCount = paidSnap.size;

  // Check if referrer has hit their goal (counting only PAID referrals)
  if (referralGoal > 0 && paidCount >= referralGoal) {
    await activateSubscription(referrerId);

    // Notify referrer of goal achievement
    await addDoc(collection(db, "notifications"), {
      userId: referrerId,
      type: "referral_goal_achieved",
      title: "Referral Goal Achieved!",
      message: `You've reached your referral goal of ${referralGoal}. Your subscription is now active!`,
      data: { goal: referralGoal },
      read: false,
      createdAt: serverTimestamp(),
    });
  } else {
    // Notify referrer of payment received
    await addDoc(collection(db, "notifications"), {
      userId: referrerId,
      type: "referral_paid",
      title: "Referral Payment Received",
      message: `${referralData.referredName} has completed their payment. ${referralGoal - paidCount} more referrals needed.`,
      data: { referredUid, remaining: referralGoal - paidCount },
      read: false,
      createdAt: serverTimestamp(),
    });
  }
}

export async function getReferralStats(uid: string) {
  const q = query(
    collection(db, "referrals"),
    where("referrerId", "==", uid)
  );
  const snap = await getDocs(q);
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const paid = all.filter((r: any) => r.paid).length;
  const active = all.filter((r: any) => r.status === "active").length;
  return {
    total: all.length,
    paid,
    active,
    pending: all.length - paid,
    referrals: all,
  };
}

// ─── Earnings ─────────────────────────────────────────────────

export async function recordEarning(
  userId: string,
  amount: number,
  currency: string,
  source: "referral" | "opportunity",
  sourceId: string,
  description: string
): Promise<void> {
  await addDoc(collection(db, "earnings"), {
    userId,
    amount,
    currency,
    source,
    sourceId,
    description,
    status: "available", // available → pending_withdrawal → withdrawn
    createdAt: serverTimestamp(),
  });

  // Update user's total earnings
  await updateDoc(doc(db, "users", userId), {
    totalEarnings: increment(amount),
    updatedAt: serverTimestamp(),
  });
}

export async function getEarnings(uid: string) {
  const q = query(
    collection(db, "earnings"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  const earnings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Calculate totals
  const available = earnings
    .filter((e: any) => e.status === "available")
    .reduce((sum, e: any) => sum + e.amount, 0);
  const pending = earnings
    .filter((e: any) => e.status === "pending_withdrawal")
    .reduce((sum, e: any) => sum + e.amount, 0);
  const withdrawn = earnings
    .filter((e: any) => e.status === "withdrawn")
    .reduce((sum, e: any) => sum + e.amount, 0);

  return {
    earnings,
    available,
    pending,
    withdrawn,
    total: available + pending + withdrawn,
  };
}

export async function requestWithdrawal(
  userId: string,
  amount: number,
  currency: string
): Promise<string> {
  const ref = await addDoc(collection(db, "withdrawals"), {
    userId,
    amount,
    currency,
    status: "pending", // pending → approved → rejected → processed
    requestedAt: serverTimestamp(),
  });

  // Mark earnings as pending withdrawal
  const earningsQ = query(
    collection(db, "earnings"),
    where("userId", "==", userId),
    where("status", "==", "available")
  );
  const earningsSnap = await getDocs(earningsQ);
  let remaining = amount;

  const batch = writeBatch(db);
  for (const earningDoc of earningsSnap.docs) {
    if (remaining <= 0) break;
    const earning = earningDoc.data();
    const toWithdraw = Math.min(remaining, earning.amount);
    batch.update(earningDoc.ref, { status: "pending_withdrawal" });
    remaining -= toWithdraw;
  }
  await batch.commit();

  return ref.id;
}

export async function getWithdrawals(uid: string) {
  const q = query(
    collection(db, "withdrawals"),
    where("userId", "==", uid),
    orderBy("requestedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllWithdrawals() {
  const q = query(
    collection(db, "withdrawals"),
    orderBy("requestedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function approveWithdrawal(withdrawalId: string): Promise<void> {
  await updateDoc(doc(db, "withdrawals", withdrawalId), {
    status: "approved",
    approvedAt: serverTimestamp(),
  });
}

export async function declineWithdrawal(withdrawalId: string, reason: string): Promise<void> {
  const withdrawalSnap = await getDoc(doc(db, "withdrawals", withdrawalId));
  if (!withdrawalSnap.exists()) return;

  const withdrawal = withdrawalSnap.data();
  const userId = withdrawal.userId;
  const amount = withdrawal.amount;

  // Update withdrawal status
  await updateDoc(doc(db, "withdrawals", withdrawalId), {
    status: "rejected",
    rejectedAt: serverTimestamp(),
    rejectionReason: reason,
  });

  // Revert earnings back to available
  const earningsQ = query(
    collection(db, "earnings"),
    where("userId", "==", userId),
    where("status", "==", "pending_withdrawal")
  );
  const earningsSnap = await getDocs(earningsQ);
  let remaining = amount;

  const batch = writeBatch(db);
  for (const earningDoc of earningsSnap.docs) {
    if (remaining <= 0) break;
    const earning = earningDoc.data();
    const toRevert = Math.min(remaining, earning.amount);
    batch.update(earningDoc.ref, { status: "available" });
    remaining -= toRevert;
  }
  await batch.commit();

  // Notify user
  await addDoc(collection(db, "notifications"), {
    userId,
    type: "withdrawal_rejected",
    title: "Withdrawal Request Declined",
    message: `Your withdrawal request of ${amount} has been declined. Reason: ${reason}`,
    data: { withdrawalId, reason },
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function processWithdrawal(withdrawalId: string): Promise<void> {
  const withdrawalSnap = await getDoc(doc(db, "withdrawals", withdrawalId));
  if (!withdrawalSnap.exists()) return;

  const withdrawal = withdrawalSnap.data();
  const userId = withdrawal.userId;
  const amount = withdrawal.amount;

  // Update withdrawal status
  await updateDoc(doc(db, "withdrawals", withdrawalId), {
    status: "processed",
    processedAt: serverTimestamp(),
  });

  // Mark earnings as withdrawn
  const earningsQ = query(
    collection(db, "earnings"),
    where("userId", "==", userId),
    where("status", "==", "pending_withdrawal")
  );
  const earningsSnap = await getDocs(earningsQ);
  let remaining = amount;

  const batch = writeBatch(db);
  for (const earningDoc of earningsSnap.docs) {
    if (remaining <= 0) break;
    const earning = earningDoc.data();
    const toWithdraw = Math.min(remaining, earning.amount);
    batch.update(earningDoc.ref, { status: "withdrawn" });
    remaining -= toWithdraw;
  }
  await batch.commit();

  // Notify user
  await addDoc(collection(db, "notifications"), {
    userId,
    type: "withdrawal_processed",
    title: "Withdrawal Processed",
    message: `Your withdrawal of ${amount} has been processed and should arrive within 2-5 business days.`,
    data: { withdrawalId, amount },
    read: false,
    createdAt: serverTimestamp(),
  });
}

// ─── Payment simulation ───────────────────────────────────────

export async function recordPayment(
  uid: string,
  amount: number,
  currency: string,
  method: string
): Promise<string> {
  const ref = await addDoc(collection(db, "payments"), {
    userId: uid,
    amount,
    currency,
    method,
    status: "completed",
    createdAt: serverTimestamp(),
  });

  await activateSubscription(uid);

  // If user was referred, mark that referral as paid
  const userSnap = await getDoc(doc(db, "users", uid));
  if (userSnap.exists()) {
    const userData = userSnap.data();
    if (userData.referredBy) {
      // Find referrer by referral code
      const referrerQ = query(
        collection(db, "users"),
        where("referralCode", "==", userData.referredBy)
      );
      const referrerSnap = await getDocs(referrerQ);
      if (!referrerSnap.empty) {
        await markReferralPaid(uid);
      }
    }
  }

  return ref.id;
}
