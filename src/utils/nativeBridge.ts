
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';

// Check if running on a native platform or in browser
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';

// Mock native call recording functions - these don't actually record calls
// but simulate the functionality for the UI to work correctly
export const startCallRecording = async (phoneNumber: string): Promise<boolean> => {
  if (!isNativePlatform()) {
    console.log('Not on native platform, simulating recording start');
    return true;
  }
  
  try {
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
