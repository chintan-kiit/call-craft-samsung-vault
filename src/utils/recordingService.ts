
import { Recording, Contact } from '../types/recording';
import { parseSamsungRecordingName } from './recordingUtils';
import { scanExistingRecordings, getFileDetails, isAndroid, isNativePlatform, showToast } from './nativeBridge';

class RecordingService {
  private listeners: Array<() => void> = [];
  private refreshInterval: NodeJS.Timeout | null = null;
  private lastRefreshTime: number = 0;

  constructor() {
    // Initialize with periodic refresh
    this.startPeriodicRefresh();
  }

  // Start periodic refresh (every 2 minutes)
  startPeriodicRefresh() {
    if (this.refreshInterval) return;
    
    this.refreshInterval = setInterval(() => {
      this.refreshRecordings();
    }, 2 * 60 * 1000); // 2 minutes
  }

  // Stop periodic refresh
  stopPeriodicRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Add listener for recording updates
  addListener(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of updates
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Manual refresh recordings
  async refreshRecordings() {
    // Don't refresh too frequently (at most once per 30 seconds)
    const now = Date.now();
    if (now - this.lastRefreshTime < 30000) return;
    
    this.lastRefreshTime = now;
    
    // Get fresh recordings
    await this.getAllRecordings(true);
    
    // Notify listeners
    this.notifyListeners();
  }

  // Get all recordings present on the device (Samsung recordings folder)
  async getAllRecordings(forceRefresh = false): Promise<Recording[]> {
    if (!isNativePlatform() || !isAndroid()) {
      console.log("Not on Android device, returning empty recordings list");
      await showToast("This app requires an Android device to access recordings");
      return [];
    }
    
    // Get filepaths from device's Samsung call recordings folder
    console.log("Scanning for real recordings on Android device");
    const filepaths = await scanExistingRecordings();
    
    if (filepaths.length === 0) {
      console.log("No recordings found on device");
      return [];
    }
    
    // Parse file info from filename/metadata
    const recordings: Recording[] = [];
    for (const filepath of filepaths) {
      const filename = filepath.split('/').pop() || '';
      const partial = parseSamsungRecordingName(filename);
      if (!partial?.phoneNumber || !partial?.timestamp) continue;

      // Get file size from filesystem
      const fileDetails = await getFileDetails(filepath);

      recordings.push({
        id: filepath,
        contactId: '', // Real contact integration would be implemented here
        phoneNumber: partial.phoneNumber,
        contactName: null, // No mock contacts
        duration: Math.floor(fileDetails.size / 16000), // Rough estimate based on file size
        timestamp: partial.timestamp,
        filepath,
        size: fileDetails?.size || 0,
        isRead: true,
      });
    }

    // Sort by most recent first
    recordings.sort((a, b) => b.timestamp - a.timestamp);
    return recordings;
  }

  // Get contacts - returns empty array as this would require actual Contacts API integration
  async getAllContacts(): Promise<Contact[]> {
    // Real implementation would use Contacts API
    return [];
  }

  // Update contact name - no-op since we're not using mock data
  updateContactName(phoneNumber: string, newName: string | null) {
    // Would update contact in real Contacts API
    return;
  }

  // Recording deletion - not implemented
  deleteRecording(recordingId: string) {
    // Would delete actual file using Filesystem API
    return false;
  }
}

export const recordingService = new RecordingService();
