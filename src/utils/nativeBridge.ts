
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';

// Check if running on a native platform or in browser
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';

// Common call recordings folder paths on Android
export const getRecordingsPaths = (): string[] => [
  '/storage/emulated/0/Calls',
  '/storage/emulated/0/Call',
  '/storage/emulated/0/recordings/call',
  '/storage/emulated/0/internal storage/recordings/call',
  '/storage/emulated/0/DCIM/CallRecordings',
  '/storage/emulated/0/Android/data/com.sec.android.app.callrecorder/files',
  '/storage/emulated/0/Android/data/com.sec.android.app.voicenote/files',
  '/storage/emulated/0/Samsung/Call',
  '/storage/emulated/0/Samsung/VoiceRecorder',
  '/storage/emulated/0/Phone/Recordings',
  '/storage/emulated/0/Phone/Call',
  '/storage/emulated/0/Phone/CallRecorder'
];

// Check and request storage permissions using native Android APIs
export const checkStoragePermission = async (): Promise<boolean> => {
  if (!isAndroid()) {
    console.log('Device is not running Android, cannot access storage');
    return false;
  }
  
  try {
    // Try directly accessing common paths to trigger permission prompt
    console.log("Attempting to access storage...");

    // First try direct permission check (this triggers system permission dialog)
    const result = await Filesystem.checkPermissions();
    console.log("Permission check result:", result);
    
    if (result.publicStorage !== 'granted') {
      // Request permission explicitly
      console.log("Requesting storage permission...");
      const requestResult = await Filesystem.requestPermissions();
      console.log("Permission request result:", requestResult);
      
      if (requestResult.publicStorage !== 'granted') {
        console.log("Permission denied by user");
        await showToast('Storage permission is required to access call recordings');
        return false;
      }
    }
    
    // Try accessing one of the paths to verify permission is working
    const paths = getRecordingsPaths();
    for (const path of paths) {
      try {
        console.log(`Trying to access path: ${path}`);
        const result = await Filesystem.readdir({
          path: path,
          directory: Directory.ExternalStorage
        });
        
        if (result && result.files) {
          console.log(`Successfully accessed ${path}, found ${result.files.length} files`);
          return true;
        }
      } catch (error) {
        console.log(`Failed to access path: ${path}`, error);
        // Continue to next path
      }
    }
    
    console.log('Could not access any recording paths');
    await showToast('Could not find call recordings folder. Please check your device storage.');
    return false;
    
  } catch (error) {
    console.error('Error checking storage permission:', error);
    await showToast('Storage permission check failed');
    return false;
  }
};

// Function to scan for existing recordings across multiple possible paths
export const scanExistingRecordings = async (): Promise<string[]> => {
  try {
    if (!isAndroid()) {
      console.log('Not on Android device, cannot scan for recordings');
      return [];
    }

    const recordings: string[] = [];
    const paths = getRecordingsPaths();
    
    for (const recordingsPath of paths) {
      try {
        console.log('Scanning recordings at path:', recordingsPath);
        const result = await Filesystem.readdir({
          path: recordingsPath,
          directory: Directory.ExternalStorage
        });

        // Filter for common recording formats
        const pathRecordings = result.files
          .filter(file => file.name.endsWith('.m4a') || 
                         file.name.endsWith('.3gp') || 
                         file.name.endsWith('.mp3') || 
                         file.name.endsWith('.wav') ||
                         file.name.includes('Call_'))
          .map(file => `${recordingsPath}/${file.name}`);

        console.log(`Found ${pathRecordings.length} recordings in ${recordingsPath}`);
        recordings.push(...pathRecordings);
      } catch (error) {
        console.log(`Error accessing ${recordingsPath}:`, error);
        // Continue to next path
      }
    }

    if (recordings.length === 0) {
      console.log('No recordings found in any location');
      await showToast('No call recordings found. Please check app permissions.');
    } else {
      console.log(`Found a total of ${recordings.length} recordings`);
    }
    
    return recordings;
  } catch (error) {
    console.error('Error scanning recordings:', error);
    await showToast('Error accessing recordings folder. Please check app permissions.');
    return [];
  }
};

// Get file details using Filesystem API
export const getFileDetails = async (filepath: string) => {
  try {
    if (!isAndroid()) {
      console.log('Not on Android device, cannot access file details');
      return {
        size: 0,
        mtime: new Date().toISOString()
      };
    }
    
    const stat = await Filesystem.stat({
      path: filepath,
      directory: Directory.ExternalStorage
    });
    
    return {
      size: stat.size,
      mtime: stat.mtime
    };
  } catch (error) {
    console.error('Error getting file details for', filepath, error);
    return {
      size: 0,
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
