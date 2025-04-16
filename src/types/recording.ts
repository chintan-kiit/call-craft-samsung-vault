
export interface Contact {
  id: string;
  name: string | null;
  phoneNumber: string;
  photoUri?: string | null;
}

export interface Recording {
  id: string;
  contactId: string;
  phoneNumber: string;
  contactName: string | null;
  duration: number; // in seconds
  timestamp: number; // unix timestamp
  filepath: string;
  size: number; // in bytes
  isRead: boolean;
}

export interface RecordingFolder {
  id: string;
  name: string;
  phoneNumber: string;
  recordings: Recording[];
  photoUri?: string | null;
}
