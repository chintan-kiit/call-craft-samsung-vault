
import { Capacitor } from '@capacitor/core';
import { Permissions } from '@capacitor/core';
import { Toast } from '@capacitor/toast';

// List of required permissions
export const REQUIRED_PERMISSIONS = [
  'android.permission.RECORD_AUDIO',
  'android.permission.READ_PHONE_STATE',
  'android.permission.READ_CONTACTS',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.READ_EXTERNAL_STORAGE',
] as const;

// Check if running on a native platform or in browser
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';

// Check permission status
export const checkPermission = async (permission: string): Promise<boolean> => {
  if (!isNativePlatform()) return false;
  
  try {
    const { state } = await Permissions.query({ name: permission as any });
    return state === 'granted';
  } catch (error) {
    console.error(`Error checking permission ${permission}:`, error);
    return false;
  }
};

// Check all required permissions
export const checkAllPermissions = async (): Promise<{[key: string]: boolean}> => {
  const permissionStatus: {[key: string]: boolean} = {};
  
  for (const permission of REQUIRED_PERMISSIONS) {
    permissionStatus[permission] = await checkPermission(permission);
  }
  
  return permissionStatus;
};

// Request a specific permission
export const requestPermission = async (permission: string): Promise<boolean> => {
  if (!isNativePlatform()) {
    console.log('Not on native platform, skipping permission request');
    return false;
  }
  
  try {
    const result = await Permissions.request({ name: permission as any });
    return result.state === 'granted';
  } catch (error) {
    console.error(`Error requesting permission ${permission}:`, error);
    return false;
  }
};

// Request all required permissions
export const requestAllPermissions = async (): Promise<boolean> => {
  if (!isNativePlatform()) {
    console.log('Not on native platform, skipping permissions request');
    return false;
  }
  
  try {
    let allGranted = true;
    
    for (const permission of REQUIRED_PERMISSIONS) {
      const granted = await requestPermission(permission);
      if (!granted) {
        allGranted = false;
        await Toast.show({
          text: `Permission ${permission} is required for the app to function properly`,
          duration: 'long',
          position: 'center'
        });
      }
    }
    
    return allGranted;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

// Mock native call recording functions
export const startCallRecording = async (phoneNumber: string): Promise<boolean> => {
  if (!isNativePlatform()) {
    console.log('Not on native platform, simulating recording start');
    return true;
  }
  
  try {
    // Check permissions before starting recording
    const hasPermissions = await requestAllPermissions();
    if (!hasPermissions) {
      await Toast.show({
        text: 'Required permissions not granted. Cannot start recording.',
        duration: 'long',
        position: 'center'
      });
      return false;
    }
    
    console.log(`Starting call recording for ${phoneNumber}`);
    // In a real app, this would use native code to start recording
    await Toast.show({
      text: `Started recording call with ${phoneNumber}`,
      duration: 'short'
    });
    return true;
  } catch (error) {
    console.error('Error starting call recording:', error);
    return false;
  }
};

export const stopCallRecording = async (phoneNumber: string): Promise<boolean> => {
  if (!isNativePlatform()) {
    console.log('Not on native platform, simulating recording stop');
    return true;
  }
  
  try {
    console.log(`Stopping call recording for ${phoneNumber}`);
    // In a real app, this would use native code to stop recording
    await Toast.show({
      text: `Stopped recording call with ${phoneNumber}`,
      duration: 'short'
    });
    return true;
  } catch (error) {
    console.error('Error stopping call recording:', error);
    return false;
  }
};

