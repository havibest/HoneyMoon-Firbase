// ============================================================
// HONEYMOON — Messaging Service
// ============================================================

import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  where,
  getDocs,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Conversation, ChatMessage } from "@/types";

export async function getOrCreateConversation(
  uid1: string,
  uid2: string
): Promise<string> {
  // Check if conversation already exists
  const q = query(
    collection(db, "conversations"),
    where("members", "array-contains", uid1)
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) => {
    const members = d.data().members as string[];
    return members.includes(uid2);
  });

  if (existing) return existing.id;

  // Create new conversation
  const ref = await addDoc(collection(db, "conversations"), {
    members: [uid1, uid2],
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export function subscribeToConversations(
  uid: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const q = query(
    collection(db, "conversations"),
    where("members", "array-contains", uid),
    orderBy("lastMessageAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const conversations: Conversation[] = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    } as Conversation));
    callback(conversations);
  });
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
    limit(100)
  );

  return onSnapshot(q, (snap) => {
    const messages: ChatMessage[] = snap.docs.map((d) => ({
      id: d.id,
      conversationId,
      ...d.data(),
    } as ChatMessage));
    callback(messages);
  });
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> {
  const batch = writeBatch(db);

  const msgRef = doc(collection(db, "conversations", conversationId, "messages"));
  batch.set(msgRef, {
    conversationId,
    senderId,
    text,
    read: false,
    createdAt: serverTimestamp(),
  });

  batch.update(doc(db, "conversations", conversationId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function markMessagesRead(
  conversationId: string,
  uid: string
): Promise<void> {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    if (d.data().senderId !== uid) {
      batch.update(d.ref, { read: true });
    }
  });
  await batch.commit();
}
