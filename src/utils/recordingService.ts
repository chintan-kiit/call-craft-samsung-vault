
import { Recording, Contact } from '../types/recording';
import { parseSamsungRecordingName } from './recordingUtils';
import { scanExistingRecordings, getFileDetails, isAndroid } from './nativeBridge';

// Mock data for contacts when not on Android
const mockContacts: Contact[] = [
  { id: '1', name: 'John Doe', phoneNumber: '1234567890' },
  { id: '2', name: 'Jane Smith', phoneNumber: '9876543210' },
  { id: '3', name: null, phoneNumber: '5551234567' },
];

class RecordingService {
  private listeners: Array<() => void> = [];
  private refreshInterval: NodeJS.Timeout | null = null;
  private lastRefreshTime: number = 0;
  private mockRecordingsCache: Recording[] | null = null;

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
    
    // Clear any cache to force refresh
    this.mockRecordingsCache = null;
    
    // Get fresh recordings
    await this.getAllRecordings(true);
    
    // Notify listeners
    this.notifyListeners();
  }

  // Creates mock recordings when not on a real device
  private async generateMockRecordings(): Promise<Recording[]> {
    if (this.mockRecordingsCache) {
      return this.mockRecordingsCache;
    }
    
    const mockData = [
      {
        phoneNumber: '1234567890',
        contactName: 'John Doe',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
        duration: 125, // 2:05
        isIncoming: true
      },
      {
        phoneNumber: '9876543210',
        contactName: 'Jane Smith',
        timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
        duration: 304, // 5:04
        isIncoming: true
      },
      {
        phoneNumber: '5551234567',
        contactName: null,
        timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        duration: 67, // 1:07
        isIncoming: false
      },
      {
        phoneNumber: '1234567890',
        contactName: 'John Doe',
        timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
        duration: 212, // 3:32
        isIncoming: false
      },
      {
        phoneNumber: '9876543210',
        contactName: 'Jane Smith',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago
        duration: 189, // 3:09
        isIncoming: true
      },
    ];
    
    const recordings: Recording[] = mockData.map((item, index) => {
      const direction = item.isIncoming ? 'INCOMING' : 'OUTGOING';
      const date = new Date(item.timestamp);
      const dateStr = date.toISOString().substring(0, 10).replace(/-/g, '');
      const timeStr = `${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
      
      const filename = `Call_${dateStr}_${timeStr}_${direction}_${item.phoneNumber}.m4a`;
      const filepath = `/storage/emulated/0/Calls/${filename}`;
      
      return {
        id: filepath,
        contactId: item.contactName ? mockContacts.find(c => c.name === item.contactName)?.id || '' : '',
        phoneNumber: item.phoneNumber,
        contactName: item.contactName,
        duration: item.duration,
        timestamp: item.timestamp,
        filepath: filepath,
        size: 1024 * 1024 * (1 + Math.random()), // 1-2 MB
        isRead: true,
      };
    });
    
    this.mockRecordingsCache = recordings;
    return recordings;
  }

  // Get all recordings present on the device (Samsung recordings folder)
  async getAllRecordings(forceRefresh = false): Promise<Recording[]> {
    // For non-Android or development, return mock data
    if (!isAndroid()) {
      console.log("Not on Android device, returning mock recordings");
      return this.generateMockRecordings();
    }
    
    // Get filepaths from device's Samsung call recordings folder
    console.log("Scanning for real recordings on Android device");
    const filepaths = await scanExistingRecordings();
    
    if (filepaths.length === 0) {
      console.log("No real recordings found, falling back to mock data");
      return this.generateMockRecordings();
    }
    
    // Parse file info from filename/metadata
    const recordings: Recording[] = [];
    for (const filepath of filepaths) {
      const filename = filepath.split('/').pop() || '';
      const partial = parseSamsungRecordingName(filename);
      if (!partial?.phoneNumber || !partial?.timestamp) continue;

      // Get file size from filesystem
      const fileDetails = await getFileDetails(filepath);

      // Look up contact name from mock contacts (would be real contacts on device)
      const contact = mockContacts.find(c => c.phoneNumber === partial.phoneNumber);

      recordings.push({
        id: filepath,
        contactId: contact?.id || '', 
        phoneNumber: partial.phoneNumber,
        contactName: contact?.name || null,
        duration: Math.floor(60 + Math.random() * 180), // Random duration between 1-4 minutes
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

  // Return mock contacts when not on Android, otherwise empty
  async getAllContacts(): Promise<Contact[]> {
    if (!isAndroid()) {
      console.log("Not on Android device, returning mock contacts");
      return mockContacts;
    }
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
