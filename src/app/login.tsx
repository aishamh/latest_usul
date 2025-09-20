import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, User } from '../store/authStore';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Usul.ai color palette - sophisticated dark theme for Islamic research
const palette = {
  background: '#1A1D23',     // Deep charcoal background
  surface: '#2D3748',        // Card/panel surfaces
  primary: '#F7FAFC',        // Primary text (clean white)
  secondary: '#CBD5E0',      // Secondary text (soft grey)
  muted: '#A0AEC0',          // Muted text
  border: '#4A5568',         // Borders and dividers
  accent: '#3182CE',         // Primary accent (scholarly blue)
  accentHover: '#2C5282',    // Accent hover state
  success: '#38A169',        // Success states
  gradient: ['#2D3748', '#1A1D23'], // Subtle gradient
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleEmailLogin = () => {
    // For demo purposes - in production this would show an email/password form
    const user: User = {
      id: 'demo_user_' + Date.now(),
      email: 'user@example.com',
      name: 'Demo User',
      provider: 'email',
    };
    login(user);
    router.replace('/');
  };

  const handleGoogleLogin = async () => {
    try {
      // For demo purposes - in production this would use Google OAuth
      Alert.alert(
        'Demo Mode',
        'Google login would integrate with Google OAuth in production. Using demo login.',
        [
          {
            text: 'Continue with Demo',
            onPress: () => {
              const user: User = {
                id: 'google_user_' + Date.now(),
                email: 'user@gmail.com',
                name: 'Google User',
                provider: 'google',
              };
              login(user);
              router.replace('/');
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Google login failed. Please try again.');
    }
  };

  const handleAppleLogin = async () => {
    try {
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          'Demo Mode',
          'Apple login is only available on iOS devices. Using demo login.',
          [
            {
              text: 'Continue with Demo',
              onPress: () => {
                const user: User = {
                  id: 'apple_user_' + Date.now(),
                  email: 'user@icloud.com',
                  name: 'Apple User',
                  provider: 'apple',
                };
                login(user);
                router.replace('/');
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }
      
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const user: User = {
        id: credential.user,
        email: credential.email || 'apple.user@icloud.com',
        name: credential.fullName ? 
          `${credential.fullName.givenName} ${credential.fullName.familyName}`.trim() : 
          'Apple User',
        provider: 'apple',
      };
      
      login(user);
      router.replace('/');
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled, do nothing
        return;
      }
      Alert.alert('Error', 'Apple login failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Usul AI</Text>
          <Text style={styles.tagline}>AI-Powered Islamic Research</Text>
          <Text style={styles.subtitle}>Access over 15,000 classical Islamic texts</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.emailButton} onPress={handleEmailLogin}>
            <Text style={styles.buttonText}>Continue with Email</Text>
          </Pressable>

          <Pressable style={styles.googleButton} onPress={handleGoogleLogin}>
            <Text style={styles.buttonText}>Continue with Google</Text>
          </Pressable>

          <Pressable style={styles.appleButton} onPress={handleAppleLogin}>
            <Text style={styles.buttonText}>Continue with Apple ID</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: palette.primary,
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    color: palette.accent,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  subtitle: {
    color: palette.secondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  emailButton: {
    backgroundColor: palette.accent,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.accentHover,
    shadowColor: palette.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  googleButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: palette.border,
  },
  appleButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: palette.border,
  },
  buttonText: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
}); 