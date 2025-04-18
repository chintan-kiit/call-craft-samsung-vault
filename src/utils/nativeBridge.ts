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
      .filter(file => file.name.endsWith('.m4a'))
      .map(file => `${recordingsPath}/${file.name}`);
  } catch (error) {
    console.error('Error scanning recordings:', error);
    await showToast('Error accessing recordings folder');
    return [];
  }
};

// Function to organize recordings into folders
export const organizeRecordings = async (): Promise<void> => {
  try {
    if (!isAndroid()) return;
    
    const recordings = await scanExistingRecordings();
    const basePath = getSamsungRecordingsPath();
    
    for (const recording of recordings) {
      const filename = recording.split('/').pop() || '';
      const parsedData = parseSamsungRecordingName(filename);
      
      if (parsedData?.phoneNumber) {
        const folderPath = `${basePath}/${parsedData.phoneNumber}`;
        
        // Create folder if it doesn't exist
        await Filesystem.mkdir({
          path: folderPath,
          directory: Directory.External,
          recursive: true
        });
        
        // Move file to folder
        await Filesystem.copy({
          from: recording,
          to: `${folderPath}/${filename}`,
          directory: Directory.External
        });
      }
    }
    
    await showToast('Recordings organized successfully');
  } catch (error) {
    console.error('Error organizing recordings:', error);
    await showToast('Error organizing recordings');
  }
};

// Toast notification helper
export const showToast = async (message: string): Promise<void> => {
  await Toast.show({
    text: message,
    duration: 'short'
  });
};
