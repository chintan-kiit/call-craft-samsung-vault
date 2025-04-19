
import React from 'react';
import { Search, Home, FolderOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppHeaderProps {
  onSettingsClick: () => void;
  onSearchClick: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onSettingsClick,
  onSearchClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="sticky top-0 z-10 bg-samsungDark-900 border-b border-samsungDark-600">
      <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
        <div className="flex items-center">
          <div className={cn(
            "flex justify-center items-center",
            "w-10 h-10 rounded-full bg-samsungGreen-500",
            "text-black mr-3"
          )}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              <path d="M14.05 2a9 9 0 0 1 8 7.94" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-xl text-green-50">Samsung Call Recorder</h1>
            <p className="text-xs text-green-300">Keep your conversations organized</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={onSearchClick}
            aria-label="Search recordings"
            className={cn(
              "p-2 rounded-full",
              "hover:bg-samsungDark-700 transition-colors",
              "text-samsungAccent-300"
            )}
          >
            <Search size={22} />
          </button>
          
          {/* Settings button removed from header as requested */}
        </div>
      </div>
      
      {/* Navigation Menu */}
      <div className="flex justify-center px-4 pb-2">
        <nav className="flex rounded-lg overflow-hidden border border-samsungDark-700 max-w-xs w-full">
          <button
            onClick={() => navigate('/')}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 py-2 px-3 text-sm transition-colors",
              isActive('/') 
                ? "bg-samsungGreen-800 text-green-50" 
                : "hover:bg-samsungDark-800 text-green-300"
            )}
          >
            <Home size={16} />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => navigate('/folders')} 
            className={cn(
              "flex flex-1 items-center justify-center gap-2 py-2 px-3 text-sm transition-colors",
              isActive('/folders') 
                ? "bg-samsungGreen-800 text-green-50" 
                : "hover:bg-samsungDark-800 text-green-300"
            )}
          >
            <FolderOpen size={16} />
            <span>Folders</span>
          </button>
          
          <button
            onClick={() => navigate('/settings')}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 py-2 px-3 text-sm transition-colors",
              isActive('/settings') 
                ? "bg-samsungGreen-800 text-green-50" 
                : "hover:bg-samsungDark-800 text-green-300"
            )}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
