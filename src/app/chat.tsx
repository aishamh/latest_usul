import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { createChatCompletion, SYSTEM_MESSAGE, type OpenAIChatMessage } from '../services/llm';
import { useConversationStore } from '../store/conversationStore';
import { Message } from '../types/conversation';
import Markdown from 'react-native-markdown-display';
import { ChatLayout } from '../components/ChatLayout';

import { theme } from '../theme/colors';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const { getConversationById, addMessage, addConversation, updateConversation } = useConversationStore();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const conversation = conversationId ? getConversationById(conversationId) : undefined;
  const messages = conversation?.messages || [];
  
  useEffect(() => {
    // Create conversation if it doesn't exist
    if (conversationId && !conversation) {
      addConversation({
        id: conversationId,
        title: 'New Chat',
        lastMessage: '',
        lastUpdated: new Date(),
        messages: []
      });
    }
  }, [conversationId, conversation, addConversation]);
  
  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    // Add user message
    addMessage(conversationId, userMessage);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare conversation history for OpenAI
      const chatMessages: OpenAIChatMessage[] = [
        SYSTEM_MESSAGE,
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user', content: userMessage.content }
      ];

      // Get AI response
      const response = await createChatCompletion({ messages: chatMessages });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      
      addMessage(conversationId, assistantMessage);
      
      // Update conversation title if this is the first exchange
      if (messages.length === 0) {
        const title = userMessage.content.length > 50 
          ? userMessage.content.substring(0, 50) + '...'
          : userMessage.content;
        updateConversation(conversationId, { title });
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Chat Error', 
        `Failed to get response: ${errorMsg}\n\nPlease check your internet connection and ensure your OpenAI API key is properly configured.`,
        [{ text: 'OK' }]
      );
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      
      addMessage(conversationId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatLayout conversationId={conversationId}>
      <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.welcomeContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>◎</Text>
            </View>
            <Text style={styles.welcomeTitle}>Welcome to Usul AI</Text>
            <Text style={styles.welcomeSubtitle}>Type your first question below</Text>
            
            <View style={styles.suggestionsContainer}>
              <Pressable style={styles.suggestionButton} onPress={() => setInputText('Explain Verse')}>
                <Text style={styles.suggestionText}>Explain Verse</Text>
              </Pressable>
              <Pressable style={styles.suggestionButton} onPress={() => setInputText('Find Hadith')}>
                <Text style={styles.suggestionText}>Find Hadith</Text>
              </Pressable>
              <Pressable style={styles.suggestionButton} onPress={() => setInputText('Meaning Elaboration')}>
                <Text style={styles.suggestionText}>Meaning Elaboration</Text>
              </Pressable>
              <Pressable style={styles.suggestionButton} onPress={() => setInputText('Explore Books')}>
                <Text style={styles.suggestionText}>Explore Books</Text>
              </Pressable>
            </View>
          </View>
        )}
        {messages.map((message) => (
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
                  fence: styles.codeBlock,
                }}
              >
                {message.content}
              </Markdown>
            ) : (
              <Text style={styles.userMessageText} selectable>
                {message.content}
              </Text>
            )}
            <View style={styles.messageFooter}>
              <Text style={[styles.timestampText, message.role === 'user' && styles.userTimestampText]}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {message.role === 'assistant' && (
                <Pressable 
                  style={styles.copyButton}
                  onPress={async () => {
                    await Clipboard.setStringAsync(message.content);
                    Alert.alert('Copied', 'Message copied to clipboard');
                  }}
                >
                  <Text style={styles.copyButtonText}>Copy</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Usul AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Pressable style={styles.filtersButton}>
            <Text style={styles.filtersIcon}>⚙</Text>
            <Text style={styles.filtersText}>Filters</Text>
          </Pressable>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Send a message..."
            placeholderTextColor={theme.secondary}
            multiline
            maxLength={1000}
            onKeyPress={(e) => {
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Pressable
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </Pressable>
        </View>
        <Text style={styles.disclaimerText}>AI can make mistakes. Check important info.</Text>
      </View>
      </View>
    </ChatLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    flex: 1,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 32,
    textAlign: 'center',
    color: theme.accent,
  },
  welcomeTitle: {
    color: theme.primary,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    color: theme.secondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  suggestionButton: {
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    margin: 6,
  },
  suggestionText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '400',
  },
  messageBubble: {
    marginVertical: 6,
    padding: 14,
    borderRadius: 16,
    maxWidth: '85%',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: theme.border,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.accent, // Blue inspired by usul.ai
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filtersIcon: {
    fontSize: 16,
    color: theme.primary,
  },
  filtersText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    flex: 1,
    color: theme.primary,
    fontSize: 16,
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
    backgroundColor: theme.surface,
    opacity: 0.6,
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
  sendButtonText: {
    color: theme.primary, // Dark text for proper contrast on accent background
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: theme.primary, // White text for contrast on surface background when disabled
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
    color: theme.accent,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  codeBlock: {
    backgroundColor: theme.surface,
    color: theme.accent,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'monospace',
    borderLeftWidth: 3,
    borderLeftColor: theme.accent,
  },
});