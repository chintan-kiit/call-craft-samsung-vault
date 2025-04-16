
import React, { useState } from 'react';
import { RecordingFolder as RecordingFolderType } from '../types/recording';
import { RecordingItem } from './RecordingItem';
import { ChevronDown, ChevronRight, User, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordingFolderProps {
  folder: RecordingFolderType;
  onPlayRecording: (recordingId: string) => void;
  onMoreOptions: (recordingId: string) => void;
}

export const RecordingFolder: React.FC<RecordingFolderProps> = ({
  folder,
  onPlayRecording,
  onMoreOptions
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Count of recordings in this folder
  const recordingCount = folder.recordings.length;
  
  // Determine the display name - if contact has a name, use it; otherwise use phone number
  const displayName = folder.name === folder.phoneNumber ? 
    `Unknown (${folder.phoneNumber})` : folder.name;
  
  // Total duration of all recordings in this folder (in seconds)
  const totalDuration = folder.recordings.reduce((sum, rec) => sum + rec.duration, 0);
  
  // Format total duration as hours and minutes
  const formatTotalDuration = () => {
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  return (
    <div className="mb-3 rounded-lg overflow-hidden border border-samsungDark-600 bg-samsungDark-800">
      <div 
        className="flex items-center p-4 cursor-pointer hover:bg-samsungDark-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-center items-center w-12 h-12 rounded-full bg-samsungGreen-500 text-black mr-4">
          {folder.name !== folder.phoneNumber ? (
            <User size={24} />
          ) : (
            <Phone size={24} />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-lg text-green-50">{displayName}</h3>
          <div className="text-sm text-green-300">
            {recordingCount} {recordingCount === 1 ? 'recording' : 'recordings'} • {formatTotalDuration()}
          </div>
        </div>
        
        <div className="text-samsungAccent-300">
          {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className={cn(
          "px-3 pb-3 pt-1",
          "divide-y divide-samsungDark-600",
          "bg-gradient-to-b from-samsungDark-800 to-samsungDark-900",
        )}>
          {folder.recordings.map(recording => (
            <div key={recording.id} className="pt-2">
              <RecordingItem
                recording={recording}
                onPlay={() => onPlayRecording(recording.id)}
                onMore={() => onMoreOptions(recording.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
