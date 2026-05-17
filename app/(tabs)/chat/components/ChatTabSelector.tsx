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


// Main ChatTabSelector component
const TABS: ChatTab[] = ['listing', 'renting'];
export function ChatTabSelector({ activeTab, onSelectTab }: ChatTabSelectorProps) {


  // Main ChatTabSelector renderer
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