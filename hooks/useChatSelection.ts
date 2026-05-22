// Hook for managing chat selection mode and bulk deletion
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useState } from "react";
import { Alert } from "react-native";
import { db } from "../firebase";

export const useChatSelection = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);

  // Toggle a single chat in/out of the selection set
  const toggleChatSelection = (id: string) => {
    setSelectedChatIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Cancel selection mode and clear all selections
  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedChatIds([]);
  };

  // Permanently delete all selected chat threads and their messages
  const deleteSelectedChats = () => {
    if (selectedChatIds.length === 0) return;

    Alert.alert(
      "Delete Conversations",
      `This will permanently delete ${selectedChatIds.length} conversation(s).`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              for (const id of selectedChatIds) {
                const messagesSnap = await getDocs(
                  collection(db, "chats", id, "messages"),
                );
                await Promise.all(
                  messagesSnap.docs.map((m) => deleteDoc(m.ref)),
                );
                await deleteDoc(doc(db, "chats", id));
              }
              cancelSelectionMode();
            } catch (error) {
              console.error("Deletion error:", error);
            }
          },
        },
      ],
    );
  };

  return {
    isSelectionMode,
    setIsSelectionMode,
    selectedChatIds,
    toggleChatSelection,
    cancelSelectionMode,
    deleteSelectedChats,
  };
};
