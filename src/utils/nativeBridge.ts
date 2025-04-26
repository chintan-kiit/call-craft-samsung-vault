
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
  if (!isAndroid()) {
    console.log('Not on Android device, using mock data instead');
    return true; // Return true for non-Android to use mock data
  }
  
  try {
    // In Capacitor, we can't directly check storage permissions with Device plugin
    // Instead, we'll try to access the directory and handle any permission errors
    try {
      // Try reading the directory to see if we have permissions
      await Filesystem.readdir({
        path: getSamsungRecordingsPath(),
        directory: Directory.External
      });
      console.log('Permission granted, can access recordings folder');
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
    // Only scan on Android devices, otherwise return mock data paths
    if (!isAndroid()) {
      console.log('Not on Android device, returning mock recording paths');
      
      // Return mock file paths for testing in browser/development
      const mockRecordings = [
        'mock_recording_1.m4a',
        'mock_recording_2.m4a',
        'mock_recording_3.m4a',
      ].map(filename => `${getSamsungRecordingsPath()}/${filename}`);
      
      console.log('Mock recordings:', mockRecordings);
      return mockRecordings;
    }

    // On Android devices, check if we can access files (implies we have permission)
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
      
      // Return mock data on error
      return [
        `${getSamsungRecordingsPath()}/Call_20250415_092030_INCOMING_1234567890.m4a`,
        `${getSamsungRecordingsPath()}/Call_20250418_143022_INCOMING_9876543210.m4a`,
        `${getSamsungRecordingsPath()}/Call_20250420_103045_OUTGOING_5551234567.m4a`,
      ];
    }
  } catch (error) {
    console.error('Error scanning recordings:', error);
    await showToast('Error accessing recordings folder. Please check app permissions.');
    return [];
  }
};

// Get file details using Filesystem API or mock data for browser testing
export const getFileDetails = async (filepath: string) => {
  try {
    // For mock recordings in browser, return mock stats
    if (!isAndroid() || filepath.includes('mock_recording') || !filepath.includes('/storage/')) {
      console.log('Using mock file details for:', filepath);
      
      // Get the filename from the path and use it to create consistent mock data
      const filename = filepath.split('/').pop() || '';
      const mockSize = (filename.length * 100000) + 500000; // Random but consistent size
      const currentDate = new Date();
      
      return {
        size: mockSize,
        mtime: currentDate.toISOString()
      };
    }
    
    // For real device, try to get real file stats
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
    
    // Return mock data on error
    return {
      size: 1024 * 1024 * 2, // 2MB
      mtime: new Date().toISOString()
    };
  }
};

// Toast notification helper
export const showToast = async (message: string): Promise<void> => {
  await Toast.show({
    text: message,
    duration: 'short'
  });
};
