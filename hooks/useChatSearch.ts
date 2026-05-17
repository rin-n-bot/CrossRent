import { useState } from 'react';
import { EnrichedChat } from './useChatList';

type ChatTab = 'listing' | 'renting';

export const useChatSearch = (chats: EnrichedChat[], activeTab: ChatTab) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats by active tab and search query
  const filteredChats = chats.filter((chat) => {
    if (chat.role !== activeTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      chat.displayEmail?.toLowerCase().includes(q) ||
      chat.lastMsgDisplay?.toLowerCase().includes(q)
    );
  });

  return {
    searchQuery,
    setSearchQuery,
    filteredChats,
  };
};