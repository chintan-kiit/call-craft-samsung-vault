
import { Recording, Contact } from '../types/recording';
import { parseSamsungRecordingName } from './recordingUtils';
import { 
  scanExistingRecordings, 
  getFileDetails, 
  isAndroid, 
  isNativePlatform, 
  showToast,
  openAppSettings 
} from './nativeBridge';
import { permissionsManager } from './permissionsManager';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { getRecordingsPaths } from './nativeBridge';
import { toast } from 'sonner';

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

  // NEW: Direct scan for recordings using new permissions manager
  async scanAllRecordingPaths(): Promise<string[]> {
    if (!isNativePlatform() || !isAndroid()) {
      console.log("Not on Android device, no recordings available");
      return [];
    }

    // Try the new permissions manager first
    const hasPermissions = await permissionsManager.checkStoragePermissions();
    
    if (!hasPermissions) {
      console.log("No storage permission detected, requesting...");
      const granted = await permissionsManager.tryAllPermissionApproaches();
      if (!granted) {
        console.log("Failed to get permissions after trying multiple approaches");
        return [];
      }
    }
    
    console.log("Scanning for recordings on Android device with verified permissions");
    
    // Get all possible paths
    const paths = getRecordingsPaths();
    const recordings: string[] = [];
    
    // Scan each path
    for (const path of paths) {
      try {
        console.log(`Scanning path: ${path}`);
        const files = await permissionsManager.listDirectory(path);
        
        if (files && files.length > 0) {
          console.log(`Found ${files.length} files in ${path}`);
          
          // Filter for audio files
          const audioFiles = files
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
            .map(file => `${path}/${file.name}`);
          
          recordings.push(...audioFiles);
          console.log(`Added ${audioFiles.length} audio files from ${path}`);
        }
      } catch (error) {
        console.log(`Error scanning ${path}:`, error);
      }
    }
    
    console.log(`Found total of ${recordings.length} recordings across all paths`);
    return recordings;
  }

  // Request storage permission and scan for recordings using new approach
  async requestPermissionAndRefresh(): Promise<boolean> {
    if (!isNativePlatform() || !isAndroid()) {
      await showToast("This app requires an Android device to access recordings");
      return false;
    }
    
    console.log("Requesting permission and refreshing recordings");
    
    // Use enhanced permission manager
    const hasPermission = await permissionsManager.tryAllPermissionApproaches();
    this.permissionChecked = true;
    
    if (!hasPermission) {
      console.log("Permission not granted, offering to open settings");
      return false;
    }
    
    // Refresh recordings
    await this.refreshRecordings();
    return true;
  }

  // Manual refresh recordings with new approach
  async refreshRecordings() {
    // Don't refresh too frequently (at most once per 15 seconds)
    const now = Date.now();
    if (now - this.lastRefreshTime < 15000) return;
    
    this.lastRefreshTime = now;
    
    // Check permissions using new manager
    if (!this.permissionChecked) {
      const hasPermission = await permissionsManager.checkStoragePermissions();
      this.permissionChecked = true;
      if (!hasPermission) {
        console.log("No permission to refresh recordings");
        return;
      }
    }
    
    // Get fresh recordings
    await this.getAllRecordings(true);
    
    // Notify listeners
    this.notifyListeners();
    
    // Log completion
    console.log("Recordings refresh completed");
  }

  // Get all recordings present on the device with new approach
  async getAllRecordings(forceRefresh = false): Promise<Recording[]> {
    if (!isNativePlatform() || !isAndroid()) {
      console.log("Not on Android device, no recordings available");
      return [];
    }
    
    console.log("Getting all recordings, force refresh:", forceRefresh);
    
    // Check permissions if not already done
    if (!this.permissionChecked) {
      const hasPermission = await permissionsManager.checkStoragePermissions();
      this.permissionChecked = true;
      if (!hasPermission) {
        console.log("No storage permission, can't get recordings");
        return [];
      }
    }
    
    // Get filepaths from device's call recordings folders using new direct scan
    console.log("Scanning for recordings on Android device");
    const filepaths = await this.scanAllRecordingPaths();
    
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
        
        // Get file details using permissions manager
        const fileStats = await permissionsManager.getFileInfo(filepath);
        
        recordings.push({
          id: filepath,
          contactId: '', 
          phoneNumber: fileInfo?.phoneNumber || 'Unknown',
          contactName: null,
          // Calculate approximate duration based on file size
          // (16KB/sec is a rough estimate for common audio formats)
          duration: Math.floor((fileStats?.size || 0) / 16000), 
          timestamp: fileInfo?.timestamp || new Date().getTime(),
          filepath,
          size: fileStats?.size || 0,
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
