import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { theme } from '../theme/colors';
import { useConversationStore } from '../store/conversationStore';
import { useRouter } from 'expo-router';

interface ChatLayoutProps {
  children: React.ReactNode;
  conversationId?: string;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children, conversationId }) => {
  const router = useRouter();
  const { conversations } = useConversationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef<TextInput>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    if (Platform.OS === 'web') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  const handleNewChat = () => {
    const newConversationId = Date.now().toString();
    router.push(`/chat?conversationId=${newConversationId}`);
  };

  const handleOpenChat = (id: string) => {
    router.push(`/chat?conversationId=${id}`);
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups: any, conversation) => {
    const date = new Date(conversation.lastUpdated);
    const dateKey = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(conversation);
    return groups;
  }, {});

  return (
    <View style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.topBar}>
        <View style={styles.leftSection}>
          <Text style={styles.logo}>Usul</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for a text... (⌘ + K)"
            placeholderTextColor={theme.secondary}
          />
          <Pressable style={styles.advancedSearchButton}>
            <Text style={styles.advancedSearchText}>Advanced Search</Text>
          </Pressable>
        </View>

        <View style={styles.rightSection}>
          <Pressable style={styles.topBarButton}>
            <Text style={styles.topBarButtonText}>English</Text>
          </Pressable>
          <Pressable style={styles.topBarButton}>
            <Text style={styles.topBarButtonText}>●</Text>
          </Pressable>
          <Pressable style={styles.topBarButton}>
            <Text style={styles.topBarButtonText}>⚙</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {/* Chat History Header */}
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Chat History</Text>
            <Pressable style={styles.sidebarIcon}>
              <Text style={styles.sidebarIconText}>⋮</Text>
            </Pressable>
          </View>

          {/* New Chat Button */}
          <Pressable style={styles.newChatButton} onPress={handleNewChat}>
            <Text style={styles.newChatIcon}>+</Text>
            <Text style={styles.newChatText}>New Chat</Text>
          </Pressable>

          {/* Chats Section */}
          <View style={styles.chatsHeader}>
            <Text style={styles.chatsTitle}>Chats</Text>
            <View style={styles.chatsIcons}>
              <Pressable style={styles.chatIcon}>
                <Text style={styles.chatIconText}>🔍</Text>
              </Pressable>
              <Pressable style={styles.chatIcon}>
                <Text style={styles.chatIconText}>⚙️</Text>
              </Pressable>
            </View>
          </View>

          {/* Conversation List */}
          <ScrollView style={styles.conversationList} showsVerticalScrollIndicator={false}>
            {Object.entries(groupedConversations).map(([date, convos]: [string, any]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{date}</Text>
                {convos.map((conversation: any) => (
                  <Pressable
                    key={conversation.id}
                    style={[
                      styles.conversationItem,
                      conversationId === conversation.id && styles.conversationItemActive
                    ]}
                    onPress={() => handleOpenChat(conversation.id)}
                  >
                    <Text style={styles.conversationTitle} numberOfLines={1}>
                      {conversation.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Main Chat Area */}
        <View style={styles.chatArea}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.accent,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  leftSection: {
    minWidth: 100,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    borderRadius: 8,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.background,
    fontSize: 14,
    paddingVertical: 4,
  },
  advancedSearchButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderLeftWidth: 1,
    borderLeftColor: theme.surface,
    marginLeft: 12,
  },
  advancedSearchText: {
    color: theme.background,
    fontSize: 12,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  topBarButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  topBarButtonText: {
    color: theme.sidebarText,
    fontSize: 14,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    backgroundColor: theme.sidebarBg,
    borderRightWidth: 1,
    borderRightColor: theme.border,
    padding: 16,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sidebarTitle: {
    color: theme.sidebarText,
    fontSize: 16,
    fontWeight: '600',
  },
  sidebarIcon: {
    padding: 4,
  },
  sidebarIconText: {
    fontSize: 16,
    color: theme.secondary,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 24,
    gap: 8,
  },
  newChatIcon: {
    fontSize: 14,
    color: theme.secondary,
  },
  newChatText: {
    color: theme.sidebarText,
    fontSize: 14,
    fontWeight: '500',
  },
  chatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chatsTitle: {
    color: theme.sidebarText,
    fontSize: 14,
    fontWeight: '600',
  },
  chatsIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  chatIcon: {
    padding: 4,
  },
  chatIconText: {
    fontSize: 12,
    color: theme.secondary,
  },
  conversationList: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    color: theme.secondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  conversationItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  conversationItemActive: {
    backgroundColor: theme.accent,
  },
  conversationTitle: {
    color: theme.sidebarText,
    fontSize: 13,
    lineHeight: 18,
  },
  chatArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
});