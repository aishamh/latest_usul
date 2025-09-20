import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0B1220" />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#0B1220' }
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
              backgroundColor: '#0F172A',
            },
            headerTintColor: '#FFFFFF',
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
              backgroundColor: '#0F172A',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            }
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
} 