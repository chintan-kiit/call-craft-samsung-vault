
import { Contact } from '../types/recording';

// Mock function to simulate loading contacts from device
// In a real app, this would use ContentResolver to fetch from Contacts provider
export const loadContacts = async (): Promise<Contact[]> => {
  // This is mock data for development - in production app this would
  // use Android's ContactsContract and ContentResolver
  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'John Smith',
      phoneNumber: '+15551234567',
      photoUri: null
    },
    {
      id: '2',
      name: 'Mary Johnson',
      phoneNumber: '+15552345678',
      photoUri: null
    },
    {
      id: '3',
      name: 'David Lee',
      phoneNumber: '+15553456789',
      photoUri: null
    },
    {
      id: '4',
      name: 'Sarah Williams',
      phoneNumber: '+15554567890',
      photoUri: null
    },
    {
      id: '5',
      name: null,
      phoneNumber: '+15555678901',
      photoUri: null
    }
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockContacts;
};

// Find contact by phone number
export const findContactByPhone = (
  contacts: Contact[],
  phoneNumber: string
): Contact | undefined => {
  return contacts.find(contact => contact.phoneNumber === phoneNumber);
};

// Update contact name (for folder renaming when contacts change)
export const updateContactInRecordings = (
  oldNumber: string,
  newContact: Contact
): void => {
  // In a real app, we would update records in a database
  console.log(`Updated contact: ${oldNumber} → ${newContact.name || newContact.phoneNumber}`);
  // For now, we just log it
};

// In a real app: Observer pattern to watch for contact changes
export const registerContactChangeObserver = (
  callback: () => void
): (() => void) => {
  // In Android, we would register a ContentObserver for Contacts
  // Return unregister function
  return () => {
    // Cleanup observer
  };
};
