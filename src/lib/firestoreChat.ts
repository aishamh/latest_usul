import { auth, db } from './firebase';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';

export async function saveUserProfile(params: {
  uid: string;
  email?: string | null;
  name?: string | null;
  avatar?: string | null;
  provider?: string | null;
}) {
  const { uid, email, name, avatar, provider } = params;
  const userRef = doc(db, 'users', uid);
  await setDoc(
    userRef,
    {
      email: email || null,
      name: name || null,
      avatar: avatar || null,
      provider: provider || null,
      lastLoginAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function upsertUserConversation(params: { uid: string; conversationId: string; title: string }) {
  const { uid, conversationId, title } = params;
  const convRef = doc(db, 'users', uid, 'conversations', conversationId);
  await setDoc(
    convRef,
    {
      title,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function addUserMessage(params: {
  uid: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}) {
  const { uid, conversationId, role, content } = params;
  const msgs = collection(db, 'users', uid, 'conversations', conversationId, 'messages');
  await addDoc(msgs, {
    role,
    content,
    createdAt: serverTimestamp(),
  });
  const convRef = doc(db, 'users', uid, 'conversations', conversationId);
  await setDoc(
    convRef,
    {
      lastMessage: { role, content, at: serverTimestamp() },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function listenToUserMessages(params: {
  uid: string;
  conversationId: string;
  onUpdate: (messages: { id: string; role: 'user' | 'assistant' | 'system'; content: string }[]) => void;
}) {
  const { uid, conversationId, onUpdate } = params;
  const msgs = collection(db, 'users', uid, 'conversations', conversationId, 'messages');
  const q = query(msgs, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    onUpdate(arr as any);
  });
}


