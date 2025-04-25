
import { Recording, Contact } from '../types/recording';
import { parseSamsungRecordingName } from './recordingUtils';
import { scanExistingRecordings, getFileDetails } from './nativeBridge';

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
    // Get filepaths from device's Samsung call recordings folder
    const filepaths = await scanExistingRecordings();
    
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
        contactId: '', 
        phoneNumber: partial.phoneNumber,
        contactName: null,
        duration: 0, // Duration would require audio file parsing
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

  // Since we're not implementing contact management, return empty
  async getAllContacts(): Promise<Contact[]> {
    return [];
  }

  // No-op since we don't store contacts
  updateContactName(phoneNumber: string, newName: string | null) {
    return;
  }

  // No file deletion implemented for safety
  deleteRecording(recordingId: string) {
    return false;
  }
}

export const recordingService = new RecordingService();
