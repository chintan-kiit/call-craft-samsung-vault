
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppHeader } from '../components/AppHeader';
import { RecordingFolder } from '../components/RecordingFolder';
import { RecordingItem } from '../components/RecordingItem';
import { RecordingPlayer } from '../components/RecordingPlayer';
import { recordingService } from '../utils/recordingService';
import { getRecordingFolders, getRecentRecordings } from '../utils/recordingUtils';
import { Recording } from '../types/recording';
import { isNativePlatform } from '../utils/nativeBridge';
import { toast } from '../components/ui/sonner';

const Index = () => {
  const [activeRecording, setActiveRecording] = useState<Recording | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Fetch recordings data
  const { data: recordings = [], isLoading: recordingsLoading } = useQuery({
    queryKey: ['recordings'],
    queryFn: async () => recordingService.getAllRecordings(),
  });

  // Fetch contacts data
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => recordingService.getAllContacts(),
  });

  // Get recent recordings and folders
  const recentRecordings = getRecentRecordings(recordings, 3);
  const folders = getRecordingFolders(recordings, contacts);

  // Handle playing a recording
  const handlePlayRecording = (recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      setActiveRecording(recording);
      toast.success(`Playing recording from ${recording.contactName || recording.phoneNumber}`);
    }
  };

  // Handle more options for a recording
  const handleMoreOptions = (recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      // In a real app, this would show options like delete, share, etc.
      toast(`Options for recording from ${recording.contactName || recording.phoneNumber}`);
    }
  };

  // Show loading state
  if (recordingsLoading || contactsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-samsungDark-900">
        <AppHeader 
          onSettingsClick={() => setSettingsOpen(true)} 
          onSearchClick={() => setSearchOpen(true)} 
        />
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center text-green-300">
            <div className="animate-pulse">Loading recordings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-samsungDark-900">
      <AppHeader 
        onSettingsClick={() => setSettingsOpen(true)} 
        onSearchClick={() => setSearchOpen(true)} 
      />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {/* Recent Recordings */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-green-50">Recent Recordings</h2>
          
          {recentRecordings.length > 0 ? (
            <div className="space-y-2">
              {recentRecordings.map(recording => (
                <RecordingItem
                  key={recording.id}
                  recording={recording}
                  onPlay={() => handlePlayRecording(recording.id)}
                  onMore={() => handleMoreOptions(recording.id)}
                  compact
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent recordings.</p>
          )}
        </section>
        
        {/* Recording Folders */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-green-50">Recordings by Contact</h2>
          
          {folders.length > 0 ? (
            <div>
              {folders.map(folder => (
                <RecordingFolder
                  key={folder.id}
                  folder={folder}
                  onPlayRecording={handlePlayRecording}
                  onMoreOptions={handleMoreOptions}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recordings available.</p>
          )}
        </section>
      </main>
      
      {/* Recording Player */}
      {activeRecording && (
        <RecordingPlayer
          recording={activeRecording}
          onClose={() => setActiveRecording(null)}
        />
      )}
    </div>
  );
};

export default Index;
