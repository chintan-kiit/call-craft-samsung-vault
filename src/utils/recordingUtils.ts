
import { Contact, Recording, RecordingFolder } from '../types/recording';

// Format duration from seconds to MM:SS
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format timestamp to readable date/time
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Get recording folders from recordings (grouped by contact)
export const getRecordingFolders = (
  recordings: Recording[],
  contacts: Contact[]
): RecordingFolder[] => {
  // Group recordings by phone number
  const recordingsByPhone: Record<string, Recording[]> = {};
  
  recordings.forEach(recording => {
    if (!recordingsByPhone[recording.phoneNumber]) {
      recordingsByPhone[recording.phoneNumber] = [];
    }
    recordingsByPhone[recording.phoneNumber].push(recording);
  });
  
  // Create folders
  return Object.keys(recordingsByPhone).map(phoneNumber => {
    const recordingsForContact = recordingsByPhone[phoneNumber];
    const contact = contacts.find(c => c.phoneNumber === phoneNumber);
    
    return {
      id: phoneNumber,
      name: contact?.name || phoneNumber,
      phoneNumber,
      recordings: recordingsForContact,
      photoUri: contact?.photoUri
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
};

// Get recent recordings (most recent first)
export const getRecentRecordings = (recordings: Recording[], limit = 3): Recording[] => {
  return [...recordings]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

// Mock function to simulate recording a call (for development only)
export const createMockRecording = (
  contact: Contact,
  duration = Math.floor(Math.random() * 600) + 30 // Random duration between 30s and 10min
): Recording => {
  const id = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now();
  const size = Math.floor(Math.random() * 1024 * 1024 * 10) + 1024 * 100; // 100KB to 10MB
  
  return {
    id,
    contactId: contact.id,
    phoneNumber: contact.phoneNumber,
    contactName: contact.name,
    duration,
    timestamp,
    filepath: `/recordings/${id}.m4a`,
    size,
    isRead: false
  };
};
