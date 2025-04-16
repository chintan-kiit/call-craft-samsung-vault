
import React from 'react';
import { formatDuration, formatTimestamp, formatFileSize } from '../utils/recordingUtils';
import { Recording } from '../types/recording';
import { Play, MoreVertical, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordingItemProps {
  recording: Recording;
  onPlay: (recording: Recording) => void;
  onMore: (recording: Recording) => void;
  compact?: boolean;
}

export const RecordingItem: React.FC<RecordingItemProps> = ({
  recording,
  onPlay,
  onMore,
  compact = false
}) => {
  const displayName = recording.contactName || recording.phoneNumber;
  
  return (
    <div 
      className={cn(
        "flex items-center p-3 rounded-lg transition-colors",
        "bg-samsungDark-800 hover:bg-samsungDark-700",
        "border border-samsungDark-600",
        "text-green-50",
        compact ? "gap-2" : "gap-4"
      )}
    >
      <div className="flex justify-center items-center w-10 h-10 rounded-full bg-samsungGreen-500 text-black">
        {recording.contactName ? (
          displayName.charAt(0).toUpperCase()
        ) : (
          <Phone size={18} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{displayName}</div>
        <div className="flex items-center gap-2 text-sm text-green-300">
          <span>{formatTimestamp(recording.timestamp)}</span>
          <span>•</span>
          <span>{formatDuration(recording.duration)}</span>
          {!compact && (
            <>
              <span>•</span>
              <span>{formatFileSize(recording.size)}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex gap-1">
        <button 
          onClick={() => onPlay(recording)}
          className="p-2 rounded-full hover:bg-samsungGreen-400 transition-colors" 
          aria-label="Play recording"
        >
          <Play size={compact ? 18 : 20} className="text-samsungAccent-300" />
        </button>
        
        <button 
          onClick={() => onMore(recording)}
          className="p-2 rounded-full hover:bg-samsungGreen-400 transition-colors" 
          aria-label="More options"
        >
          <MoreVertical size={compact ? 18 : 20} className="text-samsungAccent-300" />
        </button>
      </div>
    </div>
  );
};
