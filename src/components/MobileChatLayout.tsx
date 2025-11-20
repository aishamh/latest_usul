import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, StatusBar, Image } from 'react-native';
import { theme } from '../theme/colors';

interface MobileChatLayoutProps {
  children: React.ReactNode;
}

export const MobileChatLayout: React.FC<MobileChatLayoutProps> = ({ children }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.accent} />
      
      {/* Simple Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>
        
        <Image 
          source={require('../../assets/usul_logo_only.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        
        <Pressable style={styles.shareButton}>
          <Text style={styles.shareIcon}>⚪</Text>
        </Pressable>
      </View>

      {/* Chat Content */}
      <View style={styles.chatContent}>
        {children}
      </View>
    </SafeAreaView>
  );
};

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
  logoImage: {
    width: 28,
    height: 28,
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 16,
    color: theme.primary,
  },
  chatContent: {
    flex: 1,
  },
});