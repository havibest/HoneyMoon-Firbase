import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";

import { UserProfile } from "@/types/user";

export async function getUser(uid: string) {
  const ref = doc(db, "users", uid);

  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data() as UserProfile;
}

export async function createUser(
  user: Partial<UserProfile>
) {
  const ref = doc(db, "users", user.uid!);

  await setDoc(ref, {
    ...user,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  });
}