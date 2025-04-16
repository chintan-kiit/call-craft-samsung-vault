
import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/AppHeader';
import { RecordingItem } from '../components/RecordingItem';
import { RecordingFolder as FolderComponent } from '../components/RecordingFolder';
import { RecordingPlayer } from '../components/RecordingPlayer';
import { Recording, RecordingFolder } from '../types/recording';
import { recordingService } from '../utils/recordingService';
import { getRecordingFolders, getRecentRecordings } from '../utils/recordingUtils';
import { Folder, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [folders, setFolders] = useState<RecordingFolder[]>([]);
  const [recentRecordings, setRecentRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);

  // Load recordings on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize the recording service
        await recordingService.initialize();
        
        // Get all recordings
        const allRecordings = await recordingService.getAllRecordings();
        setRecordings(allRecordings);
        
        // Get recent recordings (top 3)
        setRecentRecordings(getRecentRecordings(allRecordings, 3));
        
        // Get all contacts
        const allContacts = await recordingService.getAllContacts();
        
        // Create folders based on contacts
        setFolders(getRecordingFolders(allRecordings, allContacts));
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load recordings:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Play a recording
  const handlePlayRecording = (recording: Recording) => {
    setSelectedRecording(recording);
  };
  
  // Find a recording by ID and play it
  const handlePlayById = (recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      setSelectedRecording(recording);
    }
  };
  
  // More options for a recording
  const handleMoreOptions = (recording: Recording) => {
    // In a real app, this would show a context menu
    console.log('Show options for recording:', recording.id);
  };
  
  // More options by ID
  const handleMoreById = (recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      handleMoreOptions(recording);
    }
  };
  
  // Handle settings click
  const handleSettingsClick = () => {
    // In a real app, this would navigate to settings
    console.log('Navigate to settings');
  };
  
  // Handle search click
  const handleSearchClick = () => {
    // In a real app, this would show search interface
    console.log('Show search interface');
  };
  
  return (
    <div className="min-h-screen bg-samsungDark-900 text-green-50">
      <AppHeader 
        onSettingsClick={handleSettingsClick}
        onSearchClick={handleSearchClick}
      />
      
      <main className="max-w-4xl mx-auto p-4 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-samsungDark-700 mb-4"></div>
              <div className="h-4 w-32 bg-samsungDark-700 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Recent Recordings Section */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <Clock size={18} className="text-samsungGreen-400 mr-2" />
                <h2 className="text-xl font-semibold">Recent Recordings</h2>
              </div>
              
              {recentRecordings.length > 0 ? (
                <div className="space-y-3">
                  {recentRecordings.map(recording => (
                    <RecordingItem
                      key={recording.id}
                      recording={recording}
                      onPlay={handlePlayRecording}
                      onMore={handleMoreOptions}
                    />
                  ))}
                </div>
              ) : (
                <div className={cn(
                  "flex flex-col items-center justify-center p-8",
                  "bg-samsungDark-800 rounded-lg border border-samsungDark-600",
                  "text-green-300"
                )}>
                  <p>No recent recordings found</p>
                </div>
              )}
            </section>
            
            {/* Folders Section */}
            <section>
              <div className="flex items-center mb-4">
                <Folder size={18} className="text-samsungGreen-400 mr-2" />
                <h2 className="text-xl font-semibold">Contact Folders</h2>
              </div>
              
              {folders.length > 0 ? (
                <div>
                  {folders.map(folder => (
                    <FolderComponent
                      key={folder.id}
                      folder={folder}
                      onPlayRecording={handlePlayById}
                      onMoreOptions={handleMoreById}
                    />
                  ))}
                </div>
              ) : (
                <div className={cn(
                  "flex flex-col items-center justify-center p-8",
                  "bg-samsungDark-800 rounded-lg border border-samsungDark-600",
                  "text-green-300"
                )}>
                  <p>No contact folders found</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      
      {/* Recording Player */}
      <RecordingPlayer
        recording={selectedRecording}
        onClose={() => setSelectedRecording(null)}
      />
    </div>
  );
};

export default Index;
