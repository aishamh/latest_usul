import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ title: 'Usul AI', headerShown: true }} />
      <Stack.Screen name="chat" options={{ title: 'Chat', headerShown: true }} />
    </Stack>
  );
} 