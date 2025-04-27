
import { Recording, Contact } from '../types/recording';
import { parseSamsungRecordingName } from './recordingUtils';
import { 
  scanExistingRecordings, 
  getFileDetails, 
  isAndroid, 
  isNativePlatform, 
  showToast, 
  checkStoragePermission,
  openAppSettings 
} from './nativeBridge';

class RecordingService {
  private listeners: Array<() => void> = [];
  private refreshInterval: NodeJS.Timeout | null = null;
  private lastRefreshTime: number = 0;
  private permissionChecked: boolean = false;

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

  // Request storage permission and scan for recordings
  async requestPermissionAndRefresh(): Promise<boolean> {
    if (!isNativePlatform() || !isAndroid()) {
      await showToast("This app requires an Android device to access recordings");
      return false;
    }
    
    // Check permissions
    const hasPermission = await checkStoragePermission();
    this.permissionChecked = true;
    
    if (!hasPermission) {
      console.log("Permission not granted, offering to open settings");
      await openAppSettings();
      return false;
    }
    
    // Refresh recordings
    await this.refreshRecordings();
    return true;
  }

  // Manual refresh recordings
  async refreshRecordings() {
    // Don't refresh too frequently (at most once per 15 seconds)
    const now = Date.now();
    if (now - this.lastRefreshTime < 15000) return;
    
    this.lastRefreshTime = now;
    
    // Skip refresh if we've never checked permissions or don't have them
    if (!this.permissionChecked) {
      const hasPermission = await checkStoragePermission();
      this.permissionChecked = true;
      if (!hasPermission) return;
    }
    
    // Get fresh recordings
    await this.getAllRecordings(true);
    
    // Notify listeners
    this.notifyListeners();
    
    // Log completion
    console.log("Recordings refresh completed");
  }

  // Get all recordings present on the device
  async getAllRecordings(forceRefresh = false): Promise<Recording[]> {
    if (!isNativePlatform() || !isAndroid()) {
      console.log("Not on Android device, no recordings available");
      return [];
    }
    
    // Check permissions if not already done
    if (!this.permissionChecked) {
      const hasPermission = await checkStoragePermission();
      this.permissionChecked = true;
      if (!hasPermission) {
        console.log("No storage permission, can't get recordings");
        return [];
      }
    }
    
    // Get filepaths from device's call recordings folders
    console.log("Scanning for recordings on Android device");
    const filepaths = await scanExistingRecordings();
    
    if (filepaths.length === 0) {
      console.log("No recordings found on device");
      return [];
    }
    
    // Parse file info from filename/metadata
    const recordings: Recording[] = [];
    for (const filepath of filepaths) {
      try {
        const filename = filepath.split('/').pop() || '';
        const fileInfo = parseSamsungRecordingName(filename);
        
        // Get file details from filesystem
        const fileDetails = await getFileDetails(filepath);
        
        recordings.push({
          id: filepath,
          contactId: '', 
          phoneNumber: fileInfo?.phoneNumber || 'Unknown',
          contactName: null,
          // Calculate approximate duration based on file size
          // (16KB/sec is a rough estimate for common audio formats)
          duration: Math.floor((fileDetails.size || 0) / 16000), 
          timestamp: fileInfo?.timestamp || new Date().getTime(),
          filepath,
          size: fileDetails?.size || 0,
          isRead: true,
        });
      } catch (error) {
        console.error("Error processing recording:", filepath, error);
      }
    }

    // Sort by most recent first
    recordings.sort((a, b) => b.timestamp - a.timestamp);
    console.log(`Processed ${recordings.length} recordings successfully`);
    return recordings;
  }

  // Get contacts - returns empty array as this would require actual Contacts API integration
  async getAllContacts(): Promise<Contact[]> {
    // Would integrate with Contacts API in a real implementation
    return [];
  }

  // Update contact name - no-op for now
  updateContactName(phoneNumber: string, newName: string | null) {
    return;
  }

  // Recording deletion - not implemented
  deleteRecording(recordingId: string) {
    // Would delete actual file using Filesystem API
    return false;
  }
}

export const recordingService = new RecordingService();
