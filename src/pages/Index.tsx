
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
import { isNativePlatform, checkStoragePermission, openAppSettings } from '../utils/nativeBridge';
import { toast } from '../components/ui/sonner';
import { Button } from '../components/ui/button';
import { ExternalLink, Settings, RefreshCw, AlertCircle } from 'lucide-react';

const Index = () => {
  const [activeRecording, setActiveRecording] = useState<Recording | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch recordings data
  const { 
    data: recordings = [], 
    isLoading: recordingsLoading, 
    refetch: refetchRecordings,
    isError: recordingsError
  } = useQuery({
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

  // Request permission explicitly
  const handleRequestPermission = async () => {
    setIsRefreshing(true);
    
    try {
      const success = await recordingService.requestPermissionAndRefresh();
      setPermissionStatus(success);
      
      if (success) {
        toast.success("Storage permission granted");
        refetchRecordings();
      } else {
        toast({
          title: "Permission denied",
          description: "Please grant storage permission in device settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error("Error requesting permissions");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Open system settings
  const openSettings = async () => {
    await openAppSettings();
    toast.info("Please grant storage permissions in settings and return to app");
  };

  // Manual refresh
  const handleRefreshRecordings = async () => {
    setIsRefreshing(true);
    try {
      await recordingService.refreshRecordings();
      await refetchRecordings();
      toast.success("Recordings refreshed");
    } catch (error) {
      console.error("Error refreshing:", error);
      toast.error("Failed to refresh recordings");
    } finally {
      setIsRefreshing(false);
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
          <div className="text-center text-green-300 mb-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-3">Storage Permission Required</h2>
            <p className="mb-6">In order to access call recordings, this app needs permission to read your device storage.</p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleRequestPermission} 
                className="bg-green-600 hover:bg-green-700 w-full"
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Requesting...' : 'Grant Permission'}
              </Button>
              
              <Button 
                onClick={openSettings}
                variant="outline" 
                className="w-full border-green-600 text-green-600 hover:bg-green-900"
              >
                <Settings size={16} className="mr-2" />
                Open System Settings
              </Button>
              
              <div className="mt-8 p-3 bg-yellow-800 bg-opacity-30 rounded-md flex items-start">
                <AlertCircle size={20} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-300 text-left">
                  If permission dialog doesn't appear, please use the "Open System Settings" button and manually grant 
                  Storage permission to the app.
                </p>
              </div>
            </div>
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
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-green-50">Call Recordings</h1>
          <Button 
            variant="outline" 
            size="sm"
            className="text-green-400 border-green-600 hover:bg-green-900"
            onClick={handleRefreshRecordings}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {recordings.length === 0 ? (
          <div className="text-center py-10 bg-samsungDark-800 rounded-lg p-6">
            <p className="text-muted-foreground mb-4">No recordings found.</p>
            
            <div className="space-y-3 max-w-xs mx-auto">
              <Button 
                onClick={handleRequestPermission} 
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                Check Permission Again
              </Button>
              
              <Button 
                onClick={openSettings}
                variant="outline" 
                className="w-full border-green-600 text-green-600 hover:bg-green-900"
              >
                <Settings size={16} className="mr-2" />
                Open System Settings
              </Button>
              
              {recordingsError && (
                <div className="mt-4 p-3 bg-red-900 bg-opacity-30 rounded-md">
                  <p className="text-sm text-red-300">
                    Error loading recordings. Please check app permissions.
                  </p>
                </div>
              )}
            </div>
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
