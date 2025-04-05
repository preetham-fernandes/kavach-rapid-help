import React, { useEffect } from 'react';
import { Vibration, Platform } from 'react-native';
import * as Sensors from 'expo-sensors';

// Configuration - adjust these values to control sensitivity
const SHAKE_THRESHOLD = 45; // Increased from 15 (higher = less sensitive)
const SHAKE_TIMEOUT = 1000; // Time window for shakes to count (ms)
const SHAKES_REQUIRED = 4;  // Increased from 3 (more shakes needed)
const SHAKE_COOLDOWN = 10000; // Minimum time between triggers (ms)

interface ShakeDetectorProps {
  onShake: () => void;
}

const ShakeDetector: React.FC<ShakeDetectorProps> = ({ onShake }) => {
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastUpdate = 0;
    let shakeCount = 0;
    let lastShakeTime = 0;
    let shakeHistory: number[] = [];

    const handleShakeEvent = () => {
      const now = Date.now();
      
      // Ignore if we're in cooldown period
      if (now - lastShakeTime < SHAKE_COOLDOWN) return;
      
      Vibration.vibrate([500, 200, 500]);
      onShake();
      shakeCount = 0;
      shakeHistory = [];
      lastShakeTime = now;
    };

    const subscription = Sensors.Accelerometer.addListener(({ x, y, z }) => {
      const currentTime = Date.now();
      
      // Only check every 100ms
      if ((currentTime - lastUpdate) > 100) {
        const diffTime = currentTime - lastUpdate;
        lastUpdate = currentTime;
        
        // Calculate acceleration difference
        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);
        
        // Combined acceleration vector
        const acceleration = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ) / diffTime * 10000;
        
        if (acceleration > SHAKE_THRESHOLD) {
          // Add timestamp to shake history
          shakeHistory.push(currentTime);
          
          // Remove shakes outside our time window
          shakeHistory = shakeHistory.filter(t => currentTime - t < SHAKE_TIMEOUT);
          
          // Update shake count
          shakeCount = shakeHistory.length;
          
          // Check if we've reached the required shakes
          if (shakeCount >= SHAKES_REQUIRED) {
            handleShakeEvent();
          }
        }
        
        lastX = x;
        lastY = y;
        lastZ = z;
      }
    });

    Sensors.Accelerometer.setUpdateInterval(100);

    return () => {
      subscription.remove();
    };
  }, [onShake]);

  return null;
};

export default ShakeDetector;