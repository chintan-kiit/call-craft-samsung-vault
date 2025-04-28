
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
import { isNativePlatform, openAppSettings } from '../utils/nativeBridge';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { ExternalLink, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { permissionsManager } from '../utils/permissionsManager';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

const Index = () => {
  const [activeRecording, setActiveRecording] = useState<Recording | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { 
    data: recordings = [], 
    isLoading: recordingsLoading, 
    refetch: refetchRecordings,
    isError: recordingsError
  } = useQuery({
    queryKey: ['recordings'],
    queryFn: async () => recordingService.getAllRecordings(),
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => recordingService.getAllContacts(),
  });

  useEffect(() => {
    const checkPermissions = async () => {
      if (isNativePlatform()) {
        // Use the new permissions manager for more reliable checks
        const hasPermission = await permissionsManager.checkStoragePermissions();
        setPermissionStatus(hasPermission);
        if (hasPermission) {
          refetchRecordings();
        }
      }
    };
    
    checkPermissions();
  }, [refetchRecordings]);

  useEffect(() => {
    const refreshOnFocus = async () => {
      if (isNativePlatform() && permissionStatus) {
        await recordingService.refreshRecordings();
        refetchRecordings();
      }
    };

    if (permissionStatus) {
      refreshOnFocus();
    }

    const removeListener = recordingService.addListener(() => {
      refetchRecordings();
    });

    return () => {
      removeListener();
    };
  }, [refetchRecordings, permissionStatus]);

  const handleRequestPermission = async () => {
    setIsRefreshing(true);
    
    try {
      // Use our enhanced permissions approach that tries multiple methods
      const success = await permissionsManager.tryAllPermissionApproaches();
      setPermissionStatus(success);
      
      if (success) {
        toast.success("Storage permission granted");
        refetchRecordings();
      } else {
        toast.error("Permission denied. Please grant storage permission in device settings.");
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error("Error requesting permissions");
    } finally {
      setIsRefreshing(false);
    }
  };

  const openSettings = async () => {
    await openAppSettings();
    toast.info("Please grant storage permissions in settings and return to app");
  };

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

  const recentRecordings = getRecentRecordings(recordings, 3);
  const folders = getRecordingFolders(recordings, contacts);

  const handlePlayRecording = (recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      setActiveRecording(recording);
      toast.success(`Playing recording from ${recording.contactName || recording.phoneNumber}`);
    }
  };

  const handleMoreOptions = (recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      toast(`Options for recording from ${recording.contactName || recording.phoneNumber}`);
    }
  };

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
              
              <Alert className="mt-4 border-yellow-500/50 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-yellow-500">Important</AlertTitle>
                <AlertDescription className="text-yellow-400 text-sm">
                  If permission dialog doesn't appear, please use the "Open System Settings" button 
                  and manually grant Storage permission to the app.
                </AlertDescription>
              </Alert>
              
              <Alert className="mt-2 border-blue-500/50 bg-blue-500/10">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-500">For Samsung Users</AlertTitle>
                <AlertDescription className="text-blue-400 text-sm">
                  Make sure to enable "Allow access to Call history" and "Allow access to Storage" 
                  in your phone's settings for this app.
                </AlertDescription>
              </Alert>
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
      
      {activeRecording && (
        <RecordingPlayer
          recording={activeRecording}
          onClose={() => setActiveRecording(null)}
        />
      )}
      
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
