
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
  '/storage/emulated/0/Phone/CallRecorder',
  // Add more common paths
  '/storage/emulated/0/Music',
  '/storage/emulated/0/Download',
  '/storage/emulated/0/Recording',
  '/storage/emulated/0/Recorder',
  '/storage/emulated/0/Audio',
  '/storage/emulated/0/VoiceRecorder',
  '/storage/emulated/0/Call Recordings',
  '/storage/emulated/0/CallRecordings'
];

// Open system app settings for this app
export const openAppSettings = async (): Promise<void> => {
  if (!isAndroid()) return;
  
  // Using direct Capacitor API to open app settings
  try {
    // @ts-ignore - We're using a direct Capacitor API
    await Capacitor.Plugins.App.openSystemSettings();
    await showToast('Opening app settings...');
  } catch (error) {
    console.error('Failed to open settings:', error);
    await showToast('Please open app settings manually to grant permissions');
  }
};

// Check and request storage permissions using native Android APIs
export const checkStoragePermission = async (): Promise<boolean> => {
  if (!isAndroid()) {
    console.log('Device is not running Android, cannot access storage');
    return false;
  }
  
  try {
    // Try directly accessing common paths to trigger permission prompt
    console.log("Attempting to access storage...");

    // Check permission status using Capacitor Filesystem API
    const result = await Filesystem.checkPermissions();
    console.log("Initial permission check result:", result);
    
    if (result.publicStorage !== 'granted') {
      console.log("Storage permission not granted, requesting...");
      
      // Request permission
      const requestResult = await Filesystem.requestPermissions();
      console.log("Permission request result:", requestResult);
      
      if (requestResult.publicStorage !== 'granted') {
        console.log("Permission denied by user");
        await showToast('Storage permission is required to access call recordings. Please grant it in system settings.');
        return false;
      }
    }
    
    // Additional verification - try to read from storage
    let accessSuccess = false;
    const paths = getRecordingsPaths();
    
    for (const path of paths.slice(0, 5)) { // Try first few paths
      try {
        await Filesystem.readdir({
          path,
          directory: Directory.ExternalStorage
        });
        
        console.log(`Successfully accessed ${path}`);
        accessSuccess = true;
        break;
      } catch (error) {
        console.log(`Failed to access ${path}:`, error);
      }
    }
    
    if (!accessSuccess) {
      console.log("Could not access any storage paths despite permission");
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Storage permission check failed:', error);
    await showToast('Storage access error. Please check app permissions in device settings.');
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
    
    // Log attempt to find recordings
    console.log(`Attempting to scan ${paths.length} potential recording paths...`);
    
    for (const recordingsPath of paths) {
      try {
        console.log('Scanning recordings at path:', recordingsPath);
        const result = await Filesystem.readdir({
          path: recordingsPath,
          directory: Directory.ExternalStorage
        });

        // Filter for common recording formats
        const audioFiles = result.files
          .filter(file => {
            const name = file.name.toLowerCase();
            return name.endsWith('.m4a') || 
                   name.endsWith('.3gp') || 
                   name.endsWith('.mp3') || 
                   name.endsWith('.wav') ||
                   name.endsWith('.amr') ||
                   name.endsWith('.aac') ||
                   name.includes('call_') ||
                   name.includes('record');
          })
          .map(file => `${recordingsPath}/${file.name}`);

        if (audioFiles.length > 0) {
          console.log(`Found ${audioFiles.length} audio files in ${recordingsPath}`);
          recordings.push(...audioFiles);
        }
      } catch (error) {
        // Continue to next path silently
      }
    }

    if (recordings.length === 0) {
      console.log('No recordings found in any scanned location');
    } else {
      console.log(`Found a total of ${recordings.length} potential recordings`);
    }
    
    return recordings;
  } catch (error) {
    console.error('Error scanning recordings:', error);
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
    duration: 'long'
  });
};
