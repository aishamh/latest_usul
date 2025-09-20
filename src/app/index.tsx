import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useConversationStore } from '../store/conversationStore';

const palette = {
  background: '#0B1220',
  surface: '#0F172A',
  primary: '#FFFFFF',
  secondary: '#9BA4B0',
  stroke: '#1F2937',
};

export default function ConversationListScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { conversations } = useConversationStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleNewChat = () => {
    const conversationId = Date.now().toString();
    router.push(`/chat?conversationId=${conversationId}`);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };
  
  const handleOpenChat = (conversationId: string) => {
    router.push(`/chat?conversationId=${conversationId}`);
  };
  
  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.userText}>{user.name || user.email}</Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
        
        <Pressable style={styles.newChatButton} onPress={handleNewChat}>
          <Text style={styles.newChatText}>+ New Chat</Text>
        </Pressable>
        
        <View style={styles.conversationList}>
          {conversations.length === 0 ? (
            <Text style={styles.emptyText}>No conversations yet. Start a new chat!</Text>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.conversationItem}
                  onPress={() => handleOpenChat(item.id)}
                >
                  <Text style={styles.conversationTitle}>{item.title}</Text>
                  <Text style={styles.conversationPreview}>
                    {item.lastMessage || 'No messages yet'}
                  </Text>
                  <Text style={styles.conversationDate}>
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </Text>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  sidebar: {
    flex: 1,
    backgroundColor: palette.surface,
    padding: 16,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.stroke,
  },
  welcomeText: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  userText: {
    color: palette.secondary,
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  logoutText: {
    color: palette.secondary,
    fontSize: 14,
  },
  newChatButton: {
    backgroundColor: '#1E40AF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  conversationList: {
    flex: 1,
  },
  conversationItem: {
    backgroundColor: palette.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  conversationTitle: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationPreview: {
    color: palette.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  conversationDate: {
    color: palette.secondary,
    fontSize: 11,
    opacity: 0.7,
  },
  emptyText: {
    color: palette.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
    fontSize: 16,
  },
});