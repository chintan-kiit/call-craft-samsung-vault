
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppHeader } from '../components/AppHeader';
import { RecordingFolder } from '../components/RecordingFolder';
import { RecordingItem } from '../components/RecordingItem';
import { RecordingPlayer } from '../components/RecordingPlayer';
import { SearchDialog } from '../components/SearchDialog';
import { recordingService } from '../utils/recordingService';
import { getRecordingFolders, getRecentRecordings } from '../utils/recordingUtils';
import { Recording } from '../types/recording';
import { isNativePlatform, checkStoragePermission } from '../utils/nativeBridge';
import { toast } from '../components/ui/sonner';
import { Button } from '../components/ui/button';

const Index = () => {
  const [activeRecording, setActiveRecording] = useState<Recording | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(null);

  // Fetch recordings data
  const { data: recordings = [], isLoading: recordingsLoading, refetch: refetchRecordings } = useQuery({
    queryKey: ['recordings'],
    queryFn: async () => recordingService.getAllRecordings(),
  });

  // Fetch contacts data
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => recordingService.getAllContacts(),
  });

  // Check permissions on first load
  useEffect(() => {
    const checkPermissions = async () => {
      if (isNativePlatform()) {
        const hasPermission = await checkStoragePermission();
        setPermissionStatus(hasPermission);
        if (hasPermission) {
          refetchRecordings();
        }
      }
    };
    
    checkPermissions();
  }, [refetchRecordings]);

  // Effect for page focus to refresh recordings
  useEffect(() => {
    const refreshOnFocus = async () => {
      if (isNativePlatform() && permissionStatus) {
        await recordingService.refreshRecordings();
        refetchRecordings();
      }
    };

    // Initial refresh if we have permission
    if (permissionStatus) {
      refreshOnFocus();
    }

    // Add listener for recordingService updates
    const removeListener = recordingService.addListener(() => {
      refetchRecordings();
    });

    // Clean up listener
    return () => {
      removeListener();
    };
  }, [refetchRecordings, permissionStatus]);

  // Request permission manually
  const handleRequestPermission = async () => {
    const hasPermission = await checkStoragePermission();
    setPermissionStatus(hasPermission);
    
    if (hasPermission) {
      toast.success("Storage permission granted");
      refetchRecordings();
    } else {
      toast.error("Storage permission denied. Please grant permission in device settings.");
    }
  };

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

  // Show permission request state if needed
  if (permissionStatus === false || permissionStatus === null) {
    return (
      <div className="flex flex-col min-h-screen bg-samsungDark-900">
        <AppHeader 
          onSettingsClick={() => setSettingsOpen(true)} 
          onSearchClick={() => setSearchOpen(true)} 
        />
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="text-center text-green-300 mb-6">
            <h2 className="text-xl font-semibold mb-3">Storage Permission Required</h2>
            <p className="mb-6">In order to access call recordings, this app needs permission to read your device storage.</p>
            <Button onClick={handleRequestPermission} className="bg-green-600 hover:bg-green-700">
              Grant Permission
            </Button>
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
        {recordings.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">No recordings found.</p>
            <Button onClick={handleRequestPermission} className="bg-green-600 hover:bg-green-700">
              Check Permission Again
            </Button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>
      
      {/* Recording Player */}
      {activeRecording && (
        <RecordingPlayer
          recording={activeRecording}
          onClose={() => setActiveRecording(null)}
        />
      )}
      
      {/* Search Dialog */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        recordings={recordings}
        onSelectRecording={handlePlayRecording}
      />
    </div>
  );
};

export default Index;
