import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface iPhoneSimulatorProps {
  children: React.ReactNode;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const IPhoneSimulator: React.FC<iPhoneSimulatorProps> = ({ children }) => {
  // iPhone 15 Pro dimensions (393x852 logical pixels)
  const IPHONE_WIDTH = 393;
  const IPHONE_HEIGHT = 852;
  
  // Calculate scale to fit screen while maintaining aspect ratio
  const scaleX = (screenWidth - 40) / (IPHONE_WIDTH + 40); // 40px margin + device frame
  const scaleY = (screenHeight - 40) / (IPHONE_HEIGHT + 120); // Extra space for device frame
  const scale = Math.min(scaleX, scaleY, 1);
  
  return (
    <View style={styles.container}>
      <View style={[styles.deviceFrame, { 
        transform: [{ scale }],
        width: IPHONE_WIDTH + 40,
        height: IPHONE_HEIGHT + 120
      }]}>
        {/* iPhone notch */}
        <View style={styles.notch} />
        
        {/* Status bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusLeft}>
            <View style={styles.timeContainer}>
              <View style={styles.timeText} />
            </View>
          </View>
          <View style={styles.statusRight}>
            <View style={styles.batteryContainer}>
              <View style={styles.signal} />
              <View style={styles.wifi} />
              <View style={styles.battery} />
            </View>
          </View>
        </View>
        
        {/* App content */}
        <View style={[styles.screenContent, { 
          width: IPHONE_WIDTH, 
          height: IPHONE_HEIGHT - 44 // Subtract status bar height
        }]}>
          {children}
        </View>
        
        {/* Home indicator */}
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deviceFrame: {
    backgroundColor: '#000',
    borderRadius: 50,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  notch: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -70,
    width: 140,
    height: 30,
    backgroundColor: '#000',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 10,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  statusLeft: {
    flex: 1,
  },
  statusRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timeContainer: {
    alignItems: 'flex-start',
  },
  timeText: {
    width: 50,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    opacity: 0.9,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signal: {
    width: 16,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  wifi: {
    width: 16,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  battery: {
    width: 24,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  screenContent: {
    backgroundColor: '#111827',
    borderRadius: 42,
    overflow: 'hidden',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -67,
    width: 134,
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 3,
    opacity: 0.3,
  },
});