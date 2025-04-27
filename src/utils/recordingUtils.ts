
import { Contact, Recording, RecordingFolder } from '../types/recording';

// Parse Samsung call recording filename
export const parseSamsungRecordingName = (filename: string): Partial<Recording> | null => {
  // Samsung saves recordings in format: Call_20250418_143022_INCOMING_1234567890.m4a
  // Pattern: Call_[date:YYYYMMDD]_[time:HHMMSS]_[INCOMING/OUTGOING]_[phoneNumber].m4a
  const samsungPattern = /Call_(\d{8})_(\d{6})_(INCOMING|OUTGOING)_(\d+)\.m4a/;
  const match = filename.match(samsungPattern);
  
  if (match) {
    const [_, date, time, direction, phoneNumber] = match;
    const timestamp = new Date(
      `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}T${time.slice(0,2)}:${time.slice(2,4)}:${time.slice(4,6)}`
    ).getTime();
    
    return {
      phoneNumber,
      timestamp,
      filepath: `/storage/emulated/0/Calls/${filename}`,
      isRead: true
    };
  }
  
  // Generic format for other recording apps
  // Extract phone number if present in filename
  const phonePattern = /(\d{10,})/ 
  const phoneMatch = filename.match(phonePattern);
  const phoneNumber = phoneMatch ? phoneMatch[1] : 'Unknown';
  
  // Try to find a date in the filename YYYYMMDD or similar
  const datePattern = /(\d{4})[-_]?(\d{2})[-_]?(\d{2})/;
  const dateMatch = filename.match(datePattern);
  
  let timestamp = new Date().getTime();
  
  if (dateMatch) {
    const [_, year, month, day] = dateMatch;
    timestamp = new Date(`${year}-${month}-${day}`).getTime();
  }
  
  return {
    phoneNumber,
    timestamp,
    filepath: filename,
    isRead: true
  };
};

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
    const phoneNumber = recording.phoneNumber.replace(/[^0-9+]/g, ''); // Clean phone number
    if (!recordingsByPhone[phoneNumber]) {
      recordingsByPhone[phoneNumber] = [];
    }
    recordingsByPhone[phoneNumber].push(recording);
  });
  
  // Create folders sorted by most recent recording
  return Object.entries(recordingsByPhone)
    .map(([phoneNumber, recordings]) => {
      const contact = contacts.find(c => c.phoneNumber.replace(/[^0-9+]/g, '') === phoneNumber);
      const sortedRecordings = recordings.sort((a, b) => b.timestamp - a.timestamp);
      
      return {
        id: phoneNumber,
        name: contact?.name || phoneNumber,
        phoneNumber,
        recordings: sortedRecordings,
        photoUri: contact?.photoUri
      };
    })
    .sort((a, b) => {
      // Sort folders by most recent recording
      const aLatest = a.recordings[0]?.timestamp || 0;
      const bLatest = b.recordings[0]?.timestamp || 0;
      return bLatest - aLatest;
    });
};

// Get recent recordings (most recent first)
export const getRecentRecordings = (recordings: Recording[], limit = 3): Recording[] => {
  return [...recordings]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};
