
import { Recording, Contact } from '../types/recording';
import { loadContacts } from './contactUtils';
import { createMockRecording } from './recordingUtils';

// This is a mock recording service that simulates a recording database/storage
// It doesn't actually record calls - it only manages simulated recordings
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
