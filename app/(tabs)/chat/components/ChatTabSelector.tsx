import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS, chatStyles } from '../styles';


// Define the possible chat tabs
type ChatTab = 'listing' | 'renting';


// Type definitions for ChatTabSelector component props
interface ChatTabSelectorProps {
  activeTab: ChatTab;
  onSelectTab: (tab: ChatTab) => void;
}


// Main component for selecting between chat tabs
const TABS: ChatTab[] = ['listing', 'renting'];
export function ChatTabSelector({ activeTab, onSelectTab }: ChatTabSelectorProps) {


  // Main render function for the tab selector
  return (
    <View style={chatStyles.tabRow}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (

          <TouchableOpacity
            key={tab}
            onPress={() => onSelectTab(tab)}
            style={[
              chatStyles.tabButton,
              { borderBottomColor: isActive ? COLORS.primary : 'transparent' },
            ]}
          >

            <Text
              style={[
                chatStyles.tabLabel,
                { color: isActive ? COLORS.primary : COLORS.textMuted },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            
          </TouchableOpacity>

        );
      })}
    </View>
  );
  
}