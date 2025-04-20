
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppHeader } from '../components/AppHeader';
import { RecordingFolder } from '../components/RecordingFolder';
import { RecordingPlayer } from '../components/RecordingPlayer';
import { SearchDialog } from '../components/SearchDialog';
import { recordingService } from '../utils/recordingService';
import { getRecordingFolders } from '../utils/recordingUtils';
import { Recording } from '../types/recording';
import { toast } from '../components/ui/sonner';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';

const Folders = () => {
  const [activeRecording, setActiveRecording] = useState<Recording | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  // Get all recording folders
  const folders = getRecordingFolders(recordings, contacts);
  
  // Sort folders based on direction
  const sortedFolders = [...folders].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    
    if (sortDirection === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

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
      toast(`Options for recording from ${recording.contactName || recording.phoneNumber}`);
    }
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-green-50">All Folders</h1>
          <button 
            onClick={toggleSortDirection}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-md",
              "text-sm transition-colors text-green-300",
              "hover:bg-samsungDark-700 bg-samsungDark-800",
              "border border-samsungDark-600"
            )}
          >
            {sortDirection === 'asc' ? (
              <>
                <SortAsc size={16} />
                <span>A-Z</span>
              </>
            ) : (
              <>
                <SortDesc size={16} />
                <span>Z-A</span>
              </>
            )}
          </button>
        </div>
        
        {/* All Folders */}
        <section>
          {sortedFolders.length > 0 ? (
            <div>
              {sortedFolders.map(folder => (
                <RecordingFolder
                  key={folder.id}
                  folder={folder}
                  onPlayRecording={handlePlayRecording}
                  onMoreOptions={handleMoreOptions}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No recordings available.</p>
            </div>
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

export default Folders;
