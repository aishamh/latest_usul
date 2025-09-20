import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const palette = {
  background: '#0B1220',
  surface: '#0F172A',
  primary: '#FFFFFF',
  secondary: '#9BA4B0',
  stroke: '#1F2937',
};

export default function ConversationListScreen() {
  const router = useRouter();

  const handleNewChat = () => {
    router.push(`/chat?conversationId=${Date.now()}`);
  };

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.welcomeText}>Welcome to Usul!</Text>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
        
        <Pressable style={styles.newChatButton} onPress={handleNewChat}>
          <Text style={styles.newChatText}>+ New Chat</Text>
        </Pressable>
        
        <View style={styles.conversationList}>
          <Text style={styles.emptyText}>No conversations yet. Start a new chat!</Text>
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
    alignItems: 'center',
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
    backgroundColor: palette.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  newChatText: {
    color: palette.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  conversationList: {
    flex: 1,
  },
  emptyText: {
    color: palette.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});