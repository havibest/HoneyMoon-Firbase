// ============================================================
// HONEYMOON — Auth Service
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { nanoid } from "nanoid";
import { getCountryCurrency } from "@/lib/constants";
import type { RegisterData } from "@/types";
import { processReferral } from "./subscription.service";

export async function registerUser(data: RegisterData): Promise<User> {
  const { email, password, displayName, country, goal } = data;

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  await updateProfile(user, { displayName });

  const referralCode = nanoid(8).toUpperCase();
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
  const { currency, amount } = getCountryCurrency(country);

  // Check for referral in URL
  const urlParams = new URLSearchParams(window.location.search);
  const referredBy = urlParams.get("ref") ?? "";

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    displayName,
    country,
    goal,
    currency,
    amountDue: amount,
    referralCode,
    referralLink,
    referralChoice: 0,
    referralCount: 0,
    referredBy,
    subscriptionStatus: "pending",
    admin: false,
    role: "user",
    profileComplete: false,
    emailVerified: false,
    online: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await sendEmailVerification(user);

  // Process referral if user was referred by someone
  if (referredBy) {
    try {
      await processReferral(referredBy, user.uid, email, displayName);
    } catch (error) {
      console.error("Failed to process referral:", error);
      // Don't fail registration if referral processing fails
    }
  }

  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  await sendEmailVerification(user);
}
