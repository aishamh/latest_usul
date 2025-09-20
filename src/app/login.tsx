import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, User } from '../store/authStore';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Usul.ai exact color palette from the website
const palette = {
  background: '#FEFEFE',     // Light cream background (exactly like usul.ai)
  surface: '#FFFFFF',        // Pure white for cards/surfaces
  primary: '#000000',        // Black text (primary)
  secondary: '#6B7280',      // Gray text (secondary)
  muted: '#9CA3AF',          // Lighter gray for muted text
  border: '#E5E7EB',         // Light gray borders
  accent: '#A0635C',         // Terracotta/rust brown (usul.ai's signature color)
  accentHover: '#8B5147',    // Darker terracotta for hover
  input: '#FFFFFF',          // White input backgrounds
  shadow: '#00000010',       // Very light shadow
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [selectedAction, setSelectedAction] = useState<'login' | 'signup' | null>(null);
  
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
        {!selectedAction ? (
          // Step 1: Choose Login or Sign Up
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to Usul</Text>
              <Text style={styles.tagline}>Choose an option to continue</Text>
            </View>
            
            <Pressable style={styles.primaryButton} onPress={() => setSelectedAction('login')}>
              <Text style={styles.buttonText}>Log in</Text>
            </Pressable>
            
            <Pressable style={styles.secondaryButton} onPress={() => setSelectedAction('signup')}>
              <Text style={styles.secondaryButtonText}>Sign up</Text>
            </Pressable>
          </>
        ) : (
          // Step 2: Choose Authentication Method
          <>
            <View style={styles.header}>
              <Text style={styles.title}>
                {selectedAction === 'login' ? 'Log in to your account' : 'Create your account'}
              </Text>
              <Text style={styles.tagline}>
                {selectedAction === 'login' ? 'Welcome back! Please enter your details' : 'Join Usul to access Islamic research texts'}
              </Text>
            </View>
            
            <Pressable style={styles.primaryButton} onPress={handleEmailLogin}>
              <Text style={styles.buttonText}>
                {selectedAction === 'login' ? 'Continue with Email' : 'Sign up with Email'}
              </Text>
            </Pressable>
            
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <Pressable style={styles.secondaryButton} onPress={handleGoogleLogin}>
              <Text style={styles.secondaryButtonText}>🔍 Continue with Google</Text>
            </Pressable>
            
            <Pressable style={styles.secondaryButton} onPress={handleAppleLogin}>
              <Text style={styles.secondaryButtonText}>🍎 Continue with Apple ID</Text>
            </Pressable>
            
            <Pressable style={styles.backButton} onPress={() => setSelectedAction(null)}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
          </>
        )}
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
    borderRadius: 12,
    padding: 40,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  title: {
    color: palette.primary,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagline: {
    color: palette.secondary,
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 0,
  },
  subtitle: {
    display: 'none', // Hide subtitle to match usul.ai exactly
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: palette.surface,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 12,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonText: {
    color: palette.surface, // White text on terracotta button
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  dividerText: {
    color: palette.muted,
    fontSize: 14,
    paddingHorizontal: 16,
  },
}); 