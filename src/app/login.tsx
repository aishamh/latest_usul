import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, User } from '../store/authStore';

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
  const { login } = useAuthStore();

  const handleEmailLogin = () => {
    const user: User = {
      id: 'email_user',
      email: 'user@example.com',
      name: 'Email User',
      provider: 'email',
    };
    login(user);
    router.push('/');
  };

  const handleGoogleLogin = () => {
    const user: User = {
      id: 'google_user',
      email: 'user@gmail.com',
      name: 'Google User',
      provider: 'google',
    };
    login(user);
    router.push('/');
  };

  const handleAppleLogin = () => {
    const user: User = {
      id: 'apple_user',
      email: 'user@icloud.com',
      name: 'Apple User',
      provider: 'apple',
    };
    login(user);
    router.push('/');
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