
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';

// Check if running on a native platform or in browser
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';

// Function to check if the device is a Samsung device
export const isSamsungDevice = async (): Promise<boolean> => {
  if (!isAndroid()) return false;
  const deviceInfo = await Capacitor.getPlatform();
  return deviceInfo.toLowerCase().includes('samsung');
};

// Mock function to simulate Samsung's call recording path
export const getSamsungRecordingsPath = (): string => {
  return '/storage/emulated/0/Calls';
};

// Toast notification helper
export const showToast = async (message: string): Promise<void> => {
  await Toast.show({
    text: message,
    duration: 'short'
  });
};
