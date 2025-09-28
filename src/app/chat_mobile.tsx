import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, Platform, SafeAreaView, StatusBar, Image } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useGlobalChat } from '../hooks/useGlobalChat';
import Markdown from 'react-native-markdown-display';
import { theme } from '../theme/colors';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    messages,
    input,
    setInput,
    submit,
    status,
    error,
    isSubmitting
  } = useGlobalChat({
    initialId: conversationId as string | undefined,
  });
  
  
  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || status !== 'ready' || isSubmitting) return;
    await submit();
  };

  // Show error if there's one
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Chat Error', 
        'Failed to get response. Please check your internet connection and ensure your OpenAI API key is properly configured.',
        [{ text: 'OK' }]
      );
    }
  }, [error]);

  const isLoading = status === 'streaming' || isSubmitting;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.accent} />
      
      {/* Clean Mobile Header */}
      <View style={styles.header}>
        <Pressable style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>
        <Text style={styles.appTitle}>Usul AI</Text>
        <Pressable style={styles.moreButton}>
          <Text style={styles.moreIcon}>⋯</Text>
        </Pressable>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeContent}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/usul_icon.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.welcomeTitle}>Welcome to Usul AI</Text>
              <Text style={styles.welcomeSubtitle}>Type your first question below</Text>
            </View>
            
            <View style={styles.bottomSuggestions}>
              <Pressable style={styles.suggestionCard} onPress={() => setInput('Explain a Quranic verse')}>
                <Text style={styles.suggestionTitle}>Explain Verse</Text>
                <Text style={styles.suggestionDesc}>Get detailed explanations</Text>
              </Pressable>
              <Pressable style={styles.suggestionCard} onPress={() => setInput('Find a specific hadith')}>
                <Text style={styles.suggestionTitle}>Find Hadith</Text>
                <Text style={styles.suggestionDesc}>Search prophetic traditions</Text>
              </Pressable>
            </View>
          </View>
        )}
        
        {messages.map((message) => {
          const content = message.parts?.map(part => part.type === 'text' ? part.text : '').join('') || '';
          return (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {message.role === 'assistant' ? (
                <Markdown
                  style={{
                    body: styles.messageText,
                    code_inline: styles.inlineCode,
                    code_block: styles.codeBlock,
                  }}
                >
                  {content}
                </Markdown>
              ) : (
                <Text style={styles.userMessageText} selectable>
                  {content}
                </Text>
              )}
              <View style={styles.messageFooter}>
                <Text style={[styles.timestampText, message.role === 'user' && styles.userTimestampText]}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {message.role === 'assistant' && (
                  <Pressable 
                    style={styles.copyButton}
                    onPress={async () => {
                      await Clipboard.setStringAsync(content);
                      Alert.alert('Copied', 'Message copied to clipboard');
                    }}
                  >
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
        {isLoading && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Usul AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything"
            placeholderTextColor={theme.secondary}
            multiline
            maxLength={1000}
            onKeyPress={(e) => {
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Pressable
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading || !isInitialized}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </Pressable>
        </View>
        <Text style={styles.disclaimerText}>AI can make mistakes. Check important info.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: theme.primary,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.primary,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 20,
    color: theme.primary,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  welcomeContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  welcomeTitle: {
    color: theme.primary,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: theme.secondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  bottomSuggestions: {
    paddingBottom: 20,
  },
  suggestionCard: {
    backgroundColor: theme.surface,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  suggestionTitle: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionDesc: {
    color: theme.secondary,
    fontSize: 14,
  },
  messageBubble: {
    marginVertical: 6,
    padding: 14,
    borderRadius: 16,
    maxWidth: '85%',
    shadowColor: theme.border,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.accent,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: theme.primary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: theme.primary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  timestampText: {
    color: theme.secondary,
    fontSize: 11,
    opacity: 0.7,
    alignSelf: 'flex-end',
  },
  userTimestampText: {
    color: theme.primary,
    opacity: 0.8,
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  typingText: {
    color: theme.secondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: 20,
    backgroundColor: theme.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
  },
  textInput: {
    flex: 1,
    color: theme.primary,
    fontSize: 16,
    minHeight: 20,
    maxHeight: 100,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: theme.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.secondary,
    opacity: 0.5,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimerText: {
    color: theme.secondary,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  copyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: theme.surface,
  },
  copyButtonText: {
    color: theme.secondary,
    fontSize: 10,
    fontWeight: '500',
  },
  inlineCode: {
    backgroundColor: theme.surface,
    color: theme.primary,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeBlock: {
    backgroundColor: theme.surface,
    color: theme.primary,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
});