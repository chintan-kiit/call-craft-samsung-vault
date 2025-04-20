
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { parseSamsungRecordingName } from './recordingUtils';

// Check if running on a native platform or in browser
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';

// Function to check if the device is a Samsung device
export const isSamsungDevice = async (): Promise<boolean> => {
  if (!isAndroid()) return false;
  const deviceInfo = await Capacitor.getPlatform();
  return deviceInfo.toLowerCase().includes('samsung');
};

// Get Samsung's call recordings path
export const getSamsungRecordingsPath = (): string => {
  // This is the standard path where Samsung devices store call recordings
  return '/storage/emulated/0/Calls';
};

// Function to scan for existing recordings
export const scanExistingRecordings = async (): Promise<string[]> => {
  try {
    if (!isAndroid()) return [];
    
    const recordingsPath = getSamsungRecordingsPath();
    const result = await Filesystem.readdir({
      path: recordingsPath,
      directory: Directory.External
    });
    
    return result.files
      .filter(file => file.name.endsWith('.m4a')) // Samsung uses .m4a format
      .map(file => `${recordingsPath}/${file.name}`);
  } catch (error) {
    console.error('Error scanning recordings:', error);
    await showToast('Error accessing recordings folder');
    return [];
  }
};

// Toast notification helper
export const showToast = async (message: string): Promise<void> => {
  await Toast.show({
    text: message,
    duration: 'short'
  });
};
