
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';

// Check if running on a native platform or in browser
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';

// Samsung call recordings folder path
export const getSamsungRecordingsPath = (): string => '/storage/emulated/0/Calls';

// Check and request storage permission
export const checkStoragePermission = async (): Promise<boolean> => {
  if (!isAndroid()) return false;
  
  try {
    // In Capacitor, we can't directly check storage permissions with Device plugin
    // Instead, we'll try to access the directory and handle any permission errors
    try {
      // Try reading the directory to see if we have permissions
      await Filesystem.readdir({
        path: getSamsungRecordingsPath(),
        directory: Directory.External
      });
      return true; // If no error was thrown, we have permission
    } catch (error) {
      console.log('Permission not granted, showing toast and returning false');
      await showToast('Storage permission is required to access call recordings');
      return false;
    }
  } catch (error) {
    console.error('Error checking storage permission:', error);
    await showToast('Error checking storage permissions');
    return false;
  }
};

// Function to scan for existing real recordings (Samsung format only)
export const scanExistingRecordings = async (): Promise<string[]> => {
  try {
    // Only scan on Android devices
    if (!isAndroid()) {
      console.log('Not on Android device, no recordings available');
      return [];
    }

    // Check if we can access files (implies we have permission)
    try {
      const recordingsPath = getSamsungRecordingsPath();
      console.log('Scanning recordings at path:', recordingsPath);

      const result = await Filesystem.readdir({
        path: recordingsPath,
        directory: Directory.External
      });

      // Filter for .m4a files (Samsung recording format)
      const recordings = result.files
        .filter(file => file.name.endsWith('.m4a'))
        .map(file => `${recordingsPath}/${file.name}`);

      console.log('Found recordings:', recordings.length);
      return recordings;
    } catch (error) {
      console.log('Error accessing recordings, likely a permissions issue:', error);
      await showToast('Error accessing recordings folder. Please check app permissions.');
      return [];
    }
  } catch (error) {
    console.error('Error scanning recordings:', error);
    await showToast('Error accessing recordings folder. Please check app permissions.');
    return [];
  }
};

// Get file details using Filesystem API
export const getFileDetails = async (filepath: string) => {
  try {
    const stat = await Filesystem.stat({
      path: filepath,
      directory: Directory.External
    });
    return {
      size: stat.size,
      mtime: stat.mtime
    };
  } catch (error) {
    console.error('Error getting file details:', error);
    return null;
  }
};

// Toast notification helper
export const showToast = async (message: string): Promise<void> => {
  await Toast.show({
    text: message,
    duration: 'short'
  });
};
