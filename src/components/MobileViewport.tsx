import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface MobileViewportProps {
  children: React.ReactNode;
  deviceType?: 'iphone15' | 'iphone15pro' | 'default';
}

export const MobileViewport: React.FC<MobileViewportProps> = ({ 
  children, 
  deviceType = 'iphone15' 
}) => {
  // Always render children normally for native iPhone app
  return <>{children}</>;
};