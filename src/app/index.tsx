import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useConversationStore } from '../store/conversationStore';
import { db } from '../lib/db';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme } from '../theme/colors';

export default function ConversationListScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const { conversations, addConversation, updateConversation, deleteConversation } = useConversationStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Sync conversations from db to conversation store on mount
  useEffect(() => {
    const syncConversations = async () => {
      try {
        if (Platform.OS === 'web') {
          // For web, use Dexie
          const allChats = await db.chats.getAll();
          allChats.forEach((chat) => {
            const existing = conversations.find(c => c.id === chat.id);
            if (!existing) {
              addConversation({
                id: chat.id,
                title: chat.title,
                lastMessage: chat.messages[chat.messages.length - 1]?.content?.substring(0, 100) || '',
                lastUpdated: chat.updatedAt,
                messages: chat.messages.map(msg => ({
                  id: msg.id,
                  content: msg.content,
                  role: msg.role,
                  timestamp: chat.updatedAt,
                  type: 'text' as const,
                })),
              });
            }
          });
        } else {
          // For React Native, load from AsyncStorage
          const keys = await AsyncStorage.getAllKeys();
          const chatKeys = keys.filter(k => k.startsWith('chat_'));
          for (const key of chatKeys) {
            const chatData = await AsyncStorage.getItem(key);
            if (chatData) {
              const chat = JSON.parse(chatData);
              const existing = conversations.find(c => c.id === chat.id);
              if (!existing) {
                addConversation({
                  id: chat.id,
                  title: chat.title,
                  lastMessage: chat.messages[chat.messages.length - 1]?.content?.substring(0, 100) || '',
                  lastUpdated: new Date(chat.updatedAt),
                  messages: chat.messages.map((msg: any) => ({
                    id: msg.id,
                    content: msg.content,
                    role: msg.role,
                    timestamp: new Date(chat.updatedAt),
                    type: 'text' as const,
                  })),
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error syncing conversations:', error);
      }
    };
    
    if (isAuthenticated) {
      syncConversations();
    }
  }, [isAuthenticated, addConversation, conversations]);
  
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

  const handleRenameConversation = (conversation: any) => {
    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt(
        'Rename chat',
        'Enter a new name for this chat.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (name) => {
              const trimmed = name?.trim();
              if (!trimmed) return;
              updateConversation(conversation.id, { title: trimmed });
              try {
                await db.chats.update(conversation.id, { title: trimmed });
              } catch (e) {
                console.error('Failed to update chat title in db:', e);
              }
            },
          },
        ],
        'plain-text',
        conversation.title,
      );
    } else {
      Alert.alert('Rename chat', 'Renaming is currently supported on iOS only.');
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    Alert.alert(
      'Delete chat',
      'This will permanently delete this chat and its messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            deleteConversation(conversationId);
            try {
              await db.chats.delete(conversationId);
            } catch (e) {
              console.error('Failed to delete chat from db:', e);
            }
          },
        },
      ],
    );
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
                  <View style={styles.conversationItemHeader}>
                    <Text style={styles.conversationTitle}>{item.title || 'Untitled chat'}</Text>
                    <View style={styles.conversationActions}>
                      <Pressable
                        onPress={(e) => {
                          // Prevent triggering open-chat press
                          // @ts-ignore
                          e?.stopPropagation?.();
                          handleRenameConversation(item);
                        }}
                      >
                        <Text style={styles.conversationActionText}>Rename</Text>
                      </Pressable>
                      <Pressable
                        onPress={(e) => {
                          // @ts-ignore
                          e?.stopPropagation?.();
                          handleDeleteConversation(item.id);
                        }}
                      >
                        <Text style={[styles.conversationActionText, styles.conversationDeleteText]}>
                          Delete
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.conversationDate}>
                    {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : ''}
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
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
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
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  newChatText: {
    color: theme.background, // Dark text for proper contrast on accent background
    fontSize: 16,
    fontWeight: '600',
  },
  conversationList: {
    flex: 1,
  },
  conversationItem: {
    backgroundColor: theme.background,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  conversationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationTitle: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 0,
  },
  conversationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  conversationActionText: {
    color: theme.secondary,
    fontSize: 12,
  },
  conversationDeleteText: {
    color: theme.accent,
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