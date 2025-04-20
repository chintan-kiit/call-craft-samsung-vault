
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Recording } from '@/types/recording';
import { formatTimestamp, formatDuration } from '@/utils/recordingUtils';
import { cn } from '@/lib/utils';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordings: Recording[];
  onSelectRecording: (recordingId: string) => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  open,
  onOpenChange,
  recordings,
  onSelectRecording,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter recordings based on search query
  const filteredRecordings = recordings.filter((recording) => {
    const searchLower = searchQuery.toLowerCase();
    
    // Search in contact name
    if (recording.contactName && recording.contactName.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in phone number
    if (recording.phoneNumber.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in date (formatted)
    if (formatTimestamp(recording.timestamp).toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });

  const handleSelect = (recordingId: string) => {
    onSelectRecording(recordingId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md p-0 gap-0 bg-samsungDark-900 border-samsungDark-700"
        // Disable the default close button from DialogContent
        closeButton={false}
      >
        <DialogHeader className="p-4 border-b border-samsungDark-700 flex-row justify-between items-center">
          <DialogTitle className="text-green-50">Search Recordings</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1 hover:bg-samsungDark-700 text-green-300"
          >
            <X size={18} />
          </button>
        </DialogHeader>
        
        <Command className="bg-transparent">
          <div className="flex items-center border-b border-samsungDark-700 px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 text-green-300" />
            <CommandInput 
              placeholder="Search by name, number, or date..." 
              className="flex h-10 w-full bg-transparent text-green-50 placeholder:text-green-300/50" 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>
          
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm text-green-300">
              No recordings found.
            </CommandEmpty>
            
            <CommandGroup>
              {filteredRecordings.map((recording) => (
                <CommandItem
                  key={recording.id}
                  onSelect={() => handleSelect(recording.id)}
                  className="px-4 py-2 cursor-pointer hover:bg-samsungDark-800"
                >
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-50">
                        {recording.contactName || recording.phoneNumber}
                      </span>
                      <span className="text-xs text-green-300">
                        {formatDuration(recording.duration)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-green-300">
                        {!recording.contactName && recording.phoneNumber}
                      </span>
                      <span className="text-xs text-green-300">
                        {formatTimestamp(recording.timestamp)}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
