// Hook for fetching and enriching user's chat conversations in real-time
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";

type ChatTab = "listing" | "renting";

export interface EnrichedChat {
  id: string;
  displayEmail: string;
  displayPhoto: string | null;
  updatedAtSeconds: number | null;
  lastMsgDisplay: string;
  isUnread: boolean;
  role: ChatTab;
  [key: string]: any;
}

const TIMESTAMP_REFRESH_INTERVAL = 60000;

const removeGhostChats = async (userId: string) => {
  try {
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
    );
    const chatsSnap = await getDocs(chatsQuery);

    for (const chatDoc of chatsSnap.docs) {
      const data = chatDoc.data();
      const messagesSnap = await getDocs(
        collection(db, "chats", chatDoc.id, "messages"),
      );

      const isCorrupted =
        !data.participants ||
        !data.updatedAt ||
        !data.lastMessage ||
        !data.lastSenderEmail ||
        messagesSnap.empty;

      if (isCorrupted) await deleteDoc(chatDoc.ref);
    }
  } catch (error) {
    console.error("Ghost chat cleanup error:", error);
  }
};

export const useChatList = () => {
  const [chats, setChats] = useState<EnrichedChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // Re-render timestamps every minute so relative labels stay accurate
  useEffect(() => {
    const interval = setInterval(
      () => setTick((prev) => prev + 1),
      TIMESTAMP_REFRESH_INTERVAL,
    );
    return () => clearInterval(interval);
  }, []);

  // Set up Firestore listeners for the user's chats
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setChats([]);
        setIsLoading(false);
        return;
      }

      removeGhostChats(user.uid);

      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid),
      );

      // Set up real-time listener for chat threads
      unsubscribeSnapshot = onSnapshot(chatsQuery, async (snapshot) => {
        const enriched = await Promise.all(
          snapshot.docs.map(async (d) => {
            const data = d.data();
            const otherId = data.participants.find(
              (id: string) => id !== user.uid,
            );
            let displayEmail = "User";
            let displayPhoto = null;

            if (otherId) {
              const [profileSnap, userSnap] = await Promise.all([
                getDoc(doc(db, "profiles", otherId)),
                getDoc(doc(db, "users", otherId)),
              ]);
              if (userSnap.exists()) displayEmail = userSnap.data().email;
              if (profileSnap.exists())
                displayPhoto = profileSnap.data().profilePicUrl || null;
            }

            const isMe = data.lastSenderEmail === user.email;
            const readBy: string[] = data.readBy ?? [];
            const isUnread =
              !!data.lastMessage && !isMe && !readBy.includes(user.uid);

            // Determine if current user is the owner (listing) or renter (renting)
            let role: ChatTab = "renting";
            if (otherId) {
              const txSnap = await getDocs(
                query(
                  collection(db, "transactions"),
                  where("ownerId", "==", user.uid),
                  where("renterId", "==", otherId),
                ),
              );
              if (!txSnap.empty) role = "listing";
            }

            // Return enriched chat data for rendering
            return {
              id: d.id,
              ...data,
              displayEmail,
              displayPhoto,
              updatedAtSeconds: data.updatedAt?.seconds ?? null,
              lastMsgDisplay: data.lastMessage
                ? `${isMe ? "You: " : ""}${data.lastMessage}`
                : "No messages yet",
              isUnread,
              role,
            } as EnrichedChat;
          }),
        );

        enriched.sort(
          (a, b) => (b.updatedAtSeconds ?? 0) - (a.updatedAtSeconds ?? 0),
        );
        setChats(enriched);
        setIsLoading(false);
      });
    });

    // Clean up listeners on unmount
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return { chats, isLoading, tick };
};
