import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, User } from '../store/authStore';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const palette = {
  background: '#0B1220',
  surface: '#0F172A',
  primary: '#FFFFFF',
  secondary: '#9BA4B0',
  stroke: '#1F2937',
  accent: '#3B82F6',
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
        <Text style={styles.title}>Welcome to Usul</Text>
        <Text style={styles.subtitle}>Choose your sign-in method</Text>

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
    padding: 20,
  },
  formContainer: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.stroke,
  },
  title: {
    color: palette.primary,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: palette.secondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
  },
  emailButton: {
    backgroundColor: palette.accent,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#DB4437',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 