import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useConversationStore } from '../store/conversationStore';

import { theme } from '../theme/colors';

export default function ConversationListScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const { conversations } = useConversationStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Give stores time to initialize
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Handle navigation after initialization
    if (isInitialized && !isLoading && !isAuthenticated) {
      const navTimer = setTimeout(() => {
        router.replace('/login');
      }, 100);
      
      return () => clearTimeout(navTimer);
    }
  }, [isInitialized, isAuthenticated, isLoading, router]);

  const handleNewChat = () => {
    const conversationId = Date.now().toString();
    router.push(`/chat?conversationId=${conversationId}`);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };
  
  const handleOpenChat = (conversationId: string) => {
    router.push(`/chat?conversationId=${conversationId}`);
  };
  
  if (!isInitialized || isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={styles.loadingText}>Loading Usul AI...</Text>
      </View>
    );
  }
  
  if (!isAuthenticated) {
    // This will be handled by the useEffect redirect
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.userText}>{user?.name || user?.email || 'User'}</Text>
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
    backgroundColor: theme.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.secondary,
    fontSize: 16,
    marginTop: 16,
  },
  sidebar: {
    flex: 1,
    backgroundColor: theme.surface,
    padding: 16,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  welcomeText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  userText: {
    color: theme.secondary,
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  logoutText: {
    color: theme.secondary,
    fontSize: 14,
  },
  newChatButton: {
    backgroundColor: theme.accent,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  newChatText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  conversationList: {
    flex: 1,
  },
  conversationItem: {
    backgroundColor: theme.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  conversationTitle: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationPreview: {
    color: theme.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  conversationDate: {
    color: theme.secondary,
    fontSize: 11,
    opacity: 0.7,
  },
  emptyText: {
    color: theme.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
    fontSize: 16,
  },
});