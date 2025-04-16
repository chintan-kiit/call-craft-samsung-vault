
import React, { useState, useEffect, useRef } from 'react';
import { formatDuration } from '../utils/recordingUtils';
import { Recording } from '../types/recording';
import { Play, Pause, X, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordingPlayerProps {
  recording: Recording | null;
  onClose: () => void;
}

export const RecordingPlayer: React.FC<RecordingPlayerProps> = ({
  recording,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Reset state when recording changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [recording]);
  
  // Handle playing state
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (recording && prev >= recording.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, recording]);
  
  // Handle click on progress bar
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !recording) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentClicked = clickX / rect.width;
    const newTime = Math.floor(percentClicked * recording.duration);
    
    setCurrentTime(newTime);
  };
  
  if (!recording) return null;
  
  const percentage = (currentTime / recording.duration) * 100;
  const displayName = recording.contactName || recording.phoneNumber;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-samsungDark-900 border-t border-samsungGreen-500 shadow-lg z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-2">
          <div className="flex-1">
            <div className="font-medium text-green-50">{displayName}</div>
            <div className="text-sm text-green-300">
              {formatDuration(currentTime)} / {formatDuration(recording.duration)}
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-samsungDark-700"
            aria-label="Close player"
          >
            <X size={20} className="text-green-300" />
          </button>
        </div>
        
        <div 
          ref={progressRef}
          className="h-2 bg-samsungDark-600 rounded-full mb-3 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-samsungGreen-400 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-center items-center gap-4">
          <Volume2 size={20} className="text-green-300" />
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              "flex justify-center items-center",
              "w-12 h-12 rounded-full",
              "bg-samsungGreen-500 text-black",
              "hover:bg-samsungGreen-400 transition-colors"
            )}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};
