import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text } from 'react-native';
import { theme } from '../theme/colors';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Give the app time to properly initialize
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isReady) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{
          color: theme.secondary,
          marginTop: 16,
          fontSize: 16
        }}>Loading Usul...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={theme.background} />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: theme.background }
        }}
      >
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Usul AI',
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.surface,
            },
            headerTintColor: theme.primary,
            headerTitleStyle: {
              fontWeight: 'bold',
            }
          }} 
        />
        <Stack.Screen 
          name="chat" 
          options={{ 
            title: 'Chat',
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.surface,
            },
            headerTintColor: theme.primary,
            headerTitleStyle: {
              fontWeight: 'bold',
            }
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
} 