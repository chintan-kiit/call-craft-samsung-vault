
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { parseSamsungRecordingName } from './recordingUtils';

// Check if running on a native platform or in browser
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';

// Samsung call recordings folder
export const getSamsungRecordingsPath = (): string => '/storage/emulated/0/Calls';

// Function to scan for existing real recordings (Samsung format only)
export const scanExistingRecordings = async (): Promise<string[]> => {
  try {
    if (!isAndroid()) return [];
    const recordingsPath = getSamsungRecordingsPath();
    const result = await Filesystem.readdir({
      path: recordingsPath,
      directory: Directory.External
    });
    // List only .m4a (Samsung recordings)
    return result.files
      .filter(file => file.name.endsWith('.m4a'))
      .map(file => `${recordingsPath}/${file.name}`);
  } catch (error) {
    console.error('Error scanning recordings:', error);
    await showToast('Error accessing recordings folder. Please check app permissions.');
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
