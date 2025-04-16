
import { Recording, Contact } from '../types/recording';
import { loadContacts } from './contactUtils';
import { createMockRecording } from './recordingUtils';

// This simulates a recording database/storage service
// In a real Samsung app, this would use actual file system APIs
class RecordingService {
  private recordings: Recording[] = [];
  private contacts: Contact[] = [];
  private isInitialized = false;
  
  // Initialize with mock data for development purposes
  async initialize() {
    if (this.isInitialized) return;
    
    this.contacts = await loadContacts();
    
    // Create some mock recordings for development
    this.contacts.forEach(contact => {
      // Create 1-5 random recordings per contact
      const recordingCount = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < recordingCount; i++) {
        this.recordings.push(createMockRecording(contact));
      }
    });
    
    // Sort recordings by timestamp (newest first)
    this.recordings.sort((a, b) => b.timestamp - a.timestamp);
    this.isInitialized = true;
  }
  
  // Get all recordings
  async getAllRecordings(): Promise<Recording[]> {
    await this.ensureInitialized();
    return [...this.recordings];
  }
  
  // Get all contacts
  async getAllContacts(): Promise<Contact[]> {
    await this.ensureInitialized();
    return [...this.contacts];
  }
  
  // Start recording a call
  // In a real app, this would use Samsung's Call Recording API
  startRecording(phoneNumber: string) {
    console.log(`Started recording call with ${phoneNumber}`);
    // In real implementation, this would start the native recording
  }
  
  // Stop recording
  // In a real app, this would use Samsung's Call Recording API
  async stopRecording(phoneNumber: string): Promise<Recording | null> {
    console.log(`Stopped recording call with ${phoneNumber}`);
    
    // Find the contact by phone number
    const contact = this.contacts.find(c => c.phoneNumber === phoneNumber) || {
      id: 'unknown',
      name: null,
      phoneNumber
    };
    
    // Create a new recording entry
    const newRecording = createMockRecording(contact);
    this.recordings.unshift(newRecording);
    
    return newRecording;
  }
  
  // Update contact name in all recordings
  updateContactName(phoneNumber: string, newName: string | null) {
    this.recordings.forEach(recording => {
      if (recording.phoneNumber === phoneNumber) {
        recording.contactName = newName;
      }
    });
  }
  
  // Delete a recording
  deleteRecording(recordingId: string) {
    const index = this.recordings.findIndex(r => r.id === recordingId);
    if (index !== -1) {
      this.recordings.splice(index, 1);
      return true;
    }
    return false;
  }
  
  // Helper to ensure service is initialized
  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

// Create singleton instance
export const recordingService = new RecordingService();
