
import { Recording, Contact } from '../types/recording';
import { parseSamsungRecordingName } from './recordingUtils';
import { scanExistingRecordings } from './nativeBridge';

// This service now accesses device files, not mock data.
class RecordingService {
  // Get all recordings present on the device (Samsung recordings folder)
  async getAllRecordings(): Promise<Recording[]> {
    // Get filepaths from device
    const filepaths = await scanExistingRecordings();

    // Parse file info from filename/metadata
    const recordings: Recording[] = [];
    for (const filepath of filepaths) {
      const filename = filepath.split('/').pop() || '';
      const partial = parseSamsungRecordingName(filename);
      if (!partial?.phoneNumber || !partial?.timestamp) continue;

      // Only minimal data is available unless more metadata extraction is added
      recordings.push({
        id: filepath, // filepath can serve as a unique id
        contactId: '', // Contact linking not implemented, could use cross-match phone
        phoneNumber: partial.phoneNumber,
        contactName: null,
        duration: 0, // Duration extraction would need audio file parsing
        timestamp: partial.timestamp,
        filepath,
        size: 0, // Could be filled with additional Filesystem.stat() logic
        isRead: true,
      });
    }

    // Sort by most recent
    recordings.sort((a, b) => b.timestamp - a.timestamp);
    return recordings;
  }

  // Since contacts are not accessible natively, return empty.
  async getAllContacts(): Promise<Contact[]> {
    return [];
  }

  updateContactName(phoneNumber: string, newName: string | null) {
    // No-op, since we don’t store contacts
  }

  deleteRecording(recordingId: string) {
    // Could implement file deletion with Filesystem.deleteFile,
    // but be cautious and only on explicit user action!
    return false;
  }
}

// Singleton instance
export const recordingService = new RecordingService();

