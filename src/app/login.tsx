import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, User } from '../store/authStore';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { GoogleIcon } from '../components/GoogleIcon';
import { AppleIcon } from '../components/AppleIcon';
import { theme } from '../theme/colors';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import * as Crypto from 'expo-crypto';
import { saveUserProfile } from '../lib/firestoreChat';
import { isFirebaseEnabled } from '../config/features';
import { createLocalUser, signInLocal } from '../lib/localAuth';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [selectedAction, setSelectedAction] = useState<'login' | 'signup' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/chat');
    }
  }, [isAuthenticated, router]);

  const handleEmailLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Missing info', 'Please enter both email and password.');
        return;
      }

      let signedIn: User;

      if (isFirebaseEnabled()) {
        // Firebase authentication
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

        signedIn = {
          id: u.uid,
          email: u.email || email.trim(),
          name: u.displayName || email.trim().split('@')[0],
          provider: 'email',
          avatar: u.photoURL || undefined,
        };
      } else {
        // Local-only authentication (no Firebase)
        if (selectedAction === 'signup') {
          signedIn = await createLocalUser(email.trim(), password);
          Alert.alert('Success', 'Account created successfully! (Local mode - no cloud sync)');
        } else {
          signedIn = await signInLocal(email.trim(), password);
        }
      }

      login(signedIn);
      router.replace('/');
    } catch (error: any) {
      const msg = error?.message || 'Email authentication failed.';
      Alert.alert('Error', msg);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (!isFirebaseEnabled()) {
        Alert.alert('Not Available', 'Google sign-in requires Firebase. Please enable Firebase in the app settings.');
        return;
      }

      // Get client IDs from Expo constants
      const clientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 
                      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
      const iosClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 
                         process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      const webClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
                         process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      
      const resolvedClientId = Platform.OS === 'ios' 
        ? (iosClientId || clientId) 
        : (webClientId || clientId);

      if (!resolvedClientId) {
        Alert.alert(
          'Configuration needed', 
          'Google sign-in is not configured. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.'
        );
        return;
      }

      const redirectUri = AuthSession.makeRedirectUri({ 
        scheme: 'usul',
        useProxy: Platform.OS === 'web',
      });

      // Use AuthRequest for Google OAuth
      // Get discovery document for Google OAuth
      const discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');
      
      if (!discovery) {
        throw new Error('Failed to fetch Google OAuth discovery document');
      }

      // Create auth request
      const request = new AuthSession.AuthRequest({
        clientId: resolvedClientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri,
        usePKCE: false,
      });

      // Prompt user for authentication
      const result = await request.promptAsync(discovery);

      if (result.type !== 'success') {
        if (result.type === 'cancel') {
          // User canceled, don't show error
          return;
        }
        throw new Error(`Google sign-in failed: ${result.type}`);
      }

      const { id_token } = result.params;
      if (!id_token) {
        throw new Error('No ID token received from Google');
      }

      const credential = GoogleAuthProvider.credential(id_token);
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
        name: u.displayName || u.email?.split('@')[0] || 'Google User',
        provider: 'google',
        avatar: u.photoURL || undefined,
      };
      
      login(signedIn);
      router.replace('/');
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = error?.message || 'Google login failed. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleAppleLogin = async () => {
    try {
      if (!isFirebaseEnabled()) {
        Alert.alert('Not Available', 'Apple sign-in requires Firebase. Please enable Firebase in the app settings.');
        return;
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          'Apple ID not available', 
          Platform.OS === 'ios' 
            ? 'Apple sign-in is not available on this device. Please check your device settings.'
            : 'Apple sign-in only works on iOS devices.'
        );
        return;
      }

      // Generate a secure random nonce
      const rawNonce = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15) + 
                      Date.now().toString(36);
      
      // Hash the nonce for Apple
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      // Request Apple sign-in
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      const { identityToken, email, fullName, user } = credential;

      if (!identityToken) {
        Alert.alert('Error', 'No identity token returned from Apple. Please try again.');
        return;
      }

      // Create Firebase credential with Apple identity token
      const provider = new OAuthProvider('apple.com');
      const firebaseCred = provider.credential({
        idToken: identityToken,
        rawNonce: rawNonce, // Use the original nonce, not the hashed one
      });

      const userCred = await signInWithCredential(auth, firebaseCred);
      const u = userCred.user;

      // Construct display name from Apple credential or Firebase user
      let displayName: string | null = null;
      if (fullName) {
        const nameParts = [];
        if (fullName.givenName) nameParts.push(fullName.givenName);
        if (fullName.familyName) nameParts.push(fullName.familyName);
        displayName = nameParts.length > 0 ? nameParts.join(' ') : null;
      }

      // Use email from credential, Firebase user, or fallback
      const userEmail = email || u.email || null;
      const userName = u.displayName || displayName || userEmail?.split('@')[0] || 'Apple User';

      await saveUserProfile({
        uid: u.uid,
        email: userEmail,
        name: userName,
        avatar: u.photoURL || null,
        provider: 'apple',
      });

      const signedIn: User = {
        id: u.uid,
        email: userEmail || 'private@apple.relay',
        name: userName,
        provider: 'apple',
        avatar: u.photoURL || undefined,
      };

      login(signedIn);
      router.replace('/');
    } catch (error: any) {
      // Handle user cancellation gracefully
      if (error.code === 'ERR_CANCELED' || error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled, don't show error
        return;
      }
      
      console.error('Apple login error:', error);
      const errorMessage = error?.message || 'Apple login failed. Please try again.';
      Alert.alert('Error', errorMessage);
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
            {isFirebaseEnabled() && (
              <>
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
              </>
            )}
            {!isFirebaseEnabled() && (
              <View style={styles.localModeNotice}>
                <Text style={styles.localModeText}>
                  🔒 Local Mode: Data stored on device only (no cloud sync)
                </Text>
              </View>
            )}
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
  localModeNotice: {
    backgroundColor: theme.background,
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  localModeText: {
    color: theme.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.primary,
    marginBottom: 12,
  },
}); 