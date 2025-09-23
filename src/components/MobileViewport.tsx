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

  const deviceDimensions = {
    iphone15: { width: 393, height: 852 },
    iphone15pro: { width: 393, height: 852 },
    default: { width: 375, height: 812 }
  };

  const { width, height } = deviceDimensions[deviceType];

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.deviceFrame}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 'auto',
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      },
    }),
  },
  deviceFrame: {
    flex: 1,
    borderRadius: 21,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
});