import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, User } from '../store/authStore';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleIcon } from '../components/GoogleIcon';
import { AppleIcon } from '../components/AppleIcon';
import { theme } from '../theme/colors';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import * as Crypto from 'expo-crypto';
import { saveUserProfile } from '../lib/firestoreChat';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [selectedAction, setSelectedAction] = useState<'login' | 'signup' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleEmailLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Missing info', 'Please enter both email and password.');
        return;
      }

      const cred = selectedAction === 'signup'
        ? await createUserWithEmailAndPassword(auth, email.trim(), password)
        : await signInWithEmailAndPassword(auth, email.trim(), password);

      const u = cred.user;
      await saveUserProfile({
        uid: u.uid,
        email: u.email,
        name: u.displayName || null,
        avatar: u.photoURL || null,
        provider: 'email',
      });

      const signedIn: User = {
        id: u.uid,
        email: u.email || email.trim(),
        name: u.displayName || email.trim().split('@')[0],
        provider: 'email',
        avatar: u.photoURL || undefined,
      };
      login(signedIn);
      router.replace('/');
    } catch (error: any) {
      const msg = error?.message || 'Email authentication failed.';
      Alert.alert('Error', msg);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const clientId = (process as any).env?.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
      const iosClientId = (process as any).env?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      const webClientId = (process as any).env?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const resolvedClientId = Platform.OS === 'ios' ? iosClientId || clientId : webClientId || clientId;

      if (!resolvedClientId) {
        Alert.alert('Configuration needed', 'Set EXPO_PUBLIC_GOOGLE_CLIENT_ID (and platform-specific IDs) to enable Google login.');
        return;
      }

      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'usul' });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token%20token&client_id=${encodeURIComponent(resolvedClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('openid email profile')}`;
      const result = await AuthSession.startAsync({ authUrl });
      if (result.type !== 'success' || !(result as any).params?.id_token) return;

      const { id_token, access_token } = (result as any).params as any;
      const credential = GoogleAuthProvider.credential(id_token, access_token);
      const userCred = await signInWithCredential(auth, credential);

      const u = userCred.user;
      await saveUserProfile({
        uid: u.uid,
        email: u.email,
        name: u.displayName || null,
        avatar: u.photoURL || null,
        provider: 'google',
      });
      const signedIn: User = {
        id: u.uid,
        email: u.email || 'unknown@google.com',
        name: u.displayName || 'Google User',
        provider: 'google',
        avatar: u.photoURL || undefined,
      };
      login(signedIn);
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Google login failed. Please try again.');
    }
  };

  const handleAppleLogin = async () => {
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Apple ID not available', 'Apple login works on iOS devices.');
        return;
      }
      const rawNonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      const { identityToken } = credential as any;
      if (!identityToken) {
        Alert.alert('Error', 'No identity token returned from Apple.');
        return;
      }
      const provider = new OAuthProvider('apple.com');
      const firebaseCred = provider.credential({ idToken: identityToken, rawNonce });
      const userCred = await signInWithCredential(auth, firebaseCred);
      const u = userCred.user;

      const displayName = credential.fullName ? `${credential.fullName.givenName ?? ''} ${credential.fullName.familyName ?? ''}`.trim() : undefined;

      await saveUserProfile({
        uid: u.uid,
        email: u.email || credential.email || null,
        name: u.displayName || displayName || 'Apple User',
        avatar: u.photoURL || null,
        provider: 'apple',
      });

      const signedIn: User = {
        id: u.uid,
        email: u.email || credential.email || 'private@apple.relay',
        name: u.displayName || displayName || 'Apple User',
        provider: 'apple',
        avatar: u.photoURL || undefined,
      };
      login(signedIn);
      router.replace('/');
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') return;
      Alert.alert('Error', 'Apple login failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        {!selectedAction ? (
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
          <>
            <View style={styles.header}>
              <Text style={styles.title}>
                {selectedAction === 'login' ? 'Log in to your account' : 'Create your account'}
              </Text>
              <Text style={styles.tagline}>
                {selectedAction === 'login' ? 'Welcome back! Please enter your details' : 'Join Usul to access Islamic research texts'}
              </Text>
            </View>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.secondary}
                autoCapitalize='none'
                keyboardType='email-address'
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.secondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
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
              <View style={styles.buttonWithIcon}>
                <GoogleIcon size={20} />
                <Text style={styles.secondaryButtonText}>Continue with Google</Text>
              </View>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={handleAppleLogin}>
              <View style={styles.buttonWithIcon}>
                <AppleIcon size={20} />
                <Text style={styles.secondaryButtonText}>Continue with Apple ID</Text>
              </View>
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
    backgroundColor: theme.background,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 40,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.border,
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
    color: theme.primary,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagline: {
    color: theme.secondary,
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 0,
  },
  subtitle: {
    display: 'none',
  },
  primaryButton: {
    backgroundColor: theme.accent,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: theme.surface,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: theme.primary,
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
    backgroundColor: theme.border,
  },
  dividerText: {
    color: theme.muted,
    fontSize: 14,
    paddingHorizontal: 16,
  },
}); 