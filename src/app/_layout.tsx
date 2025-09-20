import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#0B1220" />
      <Stack 
        initialRouteName="login" 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#0B1220' }
        }}
      >
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            gestureEnabled: false 
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
            },
            gestureEnabled: false
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
    </>
  );
} 