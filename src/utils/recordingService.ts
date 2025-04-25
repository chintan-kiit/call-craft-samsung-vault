
import { Recording, Contact } from '../types/recording';
import { parseSamsungRecordingName } from './recordingUtils';
import { scanExistingRecordings, getFileDetails } from './nativeBridge';

class RecordingService {
  // Get all recordings present on the device (Samsung recordings folder)
  async getAllRecordings(): Promise<Recording[]> {
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
