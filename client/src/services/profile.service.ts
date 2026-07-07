// ============================================================
// HONEYMOON — Profile Service
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
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types";
import { emptyProfile } from "@/types";

export async function getProfile(uid: string): Promise<UserProfile> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return { ...emptyProfile, uid };
  return { uid, ...snap.data() } as UserProfile;
}

export async function updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getDiscoverProfiles(
  currentUid: string,
  interestedIn: string = "everyone",
  pageSize: number = 20
): Promise<UserProfile[]> {
  const usersRef = collection(db, "users");
  let q;

  if (interestedIn === "everyone") {
    q = query(
      usersRef,
      where("subscriptionStatus", "==", "active"),
      where("profileComplete", "==", true),
      limit(pageSize)
    );
  } else {
    q = query(
      usersRef,
      where("subscriptionStatus", "==", "active"),
      where("profileComplete", "==", true),
      where("gender", "==", interestedIn),
      limit(pageSize)
    );
  }

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() } as UserProfile))
    .filter((p) => p.uid !== currentUid);
}

export async function getUserByReferralCode(code: string): Promise<UserProfile | null> {
  const q = query(
    collection(db, "users"),
    where("referralCode", "==", code),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, ...d.data() } as UserProfile;
}
