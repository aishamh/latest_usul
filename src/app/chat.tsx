import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const palette = {
  background: '#0B1220',
  surface: '#0F172A',
  primary: '#FFFFFF',
  secondary: '#9BA4B0',
  stroke: '#1F2937',
};

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Array<{id: string, content: string, role: 'user' | 'assistant'}>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: 'user' as const,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simple response for now
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${userMessage.content}". This is a simple response. Add your OpenAI API key to app.json extras for real AI responses.`,
        role: 'assistant' as const,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={styles.messageText}>{message.content}</Text>
          </View>
        ))}
        {isLoading && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Assistant is typing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={palette.secondary}
          multiline
          maxLength={1000}
        />
        <Pressable
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: palette.surface,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: palette.stroke,
  },
  messageText: {
    color: palette.primary,
    fontSize: 16,
    lineHeight: 20,
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: palette.stroke,
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  typingText: {
    color: palette.secondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: palette.surface,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.stroke,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: palette.primary,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendButtonDisabled: {
    backgroundColor: palette.stroke,
  },
  sendButtonText: {
    color: palette.background,
    fontSize: 16,
    fontWeight: '600',
  },
});