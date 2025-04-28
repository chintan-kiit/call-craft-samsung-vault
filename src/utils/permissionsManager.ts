
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, FileInfo } from '@capacitor/filesystem';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { toast } from "sonner";
import { getRecordingsPaths } from './nativeBridge';

class PermissionsManager {
  // Check if storage permissions are granted
  async checkStoragePermissions(): Promise<boolean> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        console.log('Running on web, simulating permissions granted');
        return true;
      }
      
      // Try to check filesystem permissions
      const permissionStatus = await Filesystem.checkPermissions();
      console.log('Permission status:', JSON.stringify(permissionStatus));
      
      if (permissionStatus.publicStorage !== 'granted') {
        return false;
      }
      
      // Additional verification - try accessing a real directory to confirm permissions work
      try {
        const paths = getRecordingsPaths();
        for (const path of paths.slice(0, 3)) {
          try {
            await Filesystem.readdir({
              path,
              directory: Directory.ExternalStorage
            });
            console.log(`Successfully accessed ${path}, permissions confirmed`);
            return true;
          } catch (err) {
            // Continue trying other paths
          }
        }
        
        console.log('Could not access any paths despite permission being "granted"');
        return false;
      } catch (err) {
        console.error('Error verifying permissions:', err);
        return false;
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }
  
  // Request storage permissions with enhanced approach for different Android versions
  async requestStoragePermissions(): Promise<boolean> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        console.log('Running on web, simulating permissions granted');
        return true;
      }

      console.log('Requesting storage permissions');
      
      // Request regular filesystem permissions
      const result = await Filesystem.requestPermissions();
      console.log('Permission request result:', JSON.stringify(result));
      
      // For Android, we need special handling for different versions
      if (Capacitor.getPlatform() === 'android') {
        const info = await Device.getInfo();
        const sdkVersion = parseInt(info.osVersion || '0');
        console.log(`Android SDK version: ${sdkVersion}`);
        
        // For Android 11+ (SDK 30+), MANAGE_EXTERNAL_STORAGE is needed for broad access
        // For Android 10 (SDK 29), scoped storage applies
        if (sdkVersion >= 29) {
          if (result.publicStorage !== 'granted') {
            toast.info("Please grant storage access in system settings");
            
            // Try to open app settings directly
            try {
              // For newer Capacitor versions
              if (typeof App.openUrl === 'function') {
                const appInfo = await App.getInfo();
                await App.openUrl({
                  url: `package:${appInfo.id}`
                });
              } else {
                // Fallback for older Capacitor versions or different API
                // @ts-ignore - Handle potential API differences
                await App.openSettings();
              }
              
              console.log('Opened app settings');
              return false; // Return false as user needs to grant permission in settings
            } catch (e) {
              console.error('Failed to open app settings:', e);
              return false;
            }
          }
        }
      }
      
      // Check permissions after request
      const newStatus = await Filesystem.checkPermissions();
      return newStatus.publicStorage === 'granted';
    } catch (error) {
      console.error('Failed to request permissions:', error);
      toast.error("Permission request failed");
      return false;
    }
  }
  
  // Attempt all possible methods to get permissions
  async tryAllPermissionApproaches(): Promise<boolean> {
    try {
      console.log("Trying multiple approaches to get storage permissions");
      
      // First check if we already have permissions
      const hasPermissions = await this.checkStoragePermissions();
      if (hasPermissions) {
        console.log("Already have storage permissions");
        return true;
      }
      
      // Try regular permission request
      console.log("Trying standard permission request");
      const standardRequest = await this.requestStoragePermissions();
      if (standardRequest) {
        console.log("Standard permission request succeeded");
        return true;
      }
      
      // If we're on Android, try a more direct approach for testing
      if (Capacitor.getPlatform() === 'android') {
        const info = await Device.getInfo();
        console.log(`Device info: Android ${info.osVersion} (SDK ${info.platform})`);
        
        // For newer Android versions, advise to use settings
        toast.info("Please manually grant storage permission in settings");
        
        try {
          // Try to open system settings for the app
          const appInfo = await App.getInfo();
          console.log(`Opening settings for app: ${appInfo.id}`);
          
          try {
            await App.openUrl({
              url: `package:${appInfo.id}`
            });
          } catch (err) {
            // Fallback to older API
            // @ts-ignore - Force usage of potentially available method
            await App.openSettings();
          }
        } catch (e) {
          console.error('Failed to open settings:', e);
        }
      }
      
      return false;
    } catch (err) {
      console.error("Error in permission approaches:", err);
      return false;
    }
  }

  // Access and list directories with enhanced error handling
  async listDirectory(path: string): Promise<FileInfo[]> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        console.log('Running on web, returning mock files');
        return [];
      }

      console.log(`Attempting to list directory at path: ${path}`);
      
      try {
        const result = await Filesystem.readdir({
          path: path,
          directory: Directory.ExternalStorage
        });
        
        console.log(`Successfully listed ${result.files?.length || 0} files in ${path}`);
        return result.files || [];
      } catch (err) {
        console.log(`Failed to access ${path}, checking permissions...`);
        
        // If we failed, check if it's a permission issue
        const hasPermissions = await this.checkStoragePermissions();
        if (!hasPermissions) {
          console.log("Permission denied, requesting permissions...");
          const granted = await this.tryAllPermissionApproaches();
          if (!granted) {
            console.log("Failed to get permissions");
            return [];
          }
          
          // Try again after permissions granted
          try {
            const retryResult = await Filesystem.readdir({
              path: path,
              directory: Directory.ExternalStorage
            });
            return retryResult.files || [];
          } catch (retryErr) {
            console.error("Still failed after permissions granted:", retryErr);
            return [];
          }
        }
        
        console.error('Error listing directory with permission:', err);
        return [];
      }
    } catch (error) {
      console.error('Error in listDirectory:', error);
      return [];
    }
  }

  // Read file details with better error handling
  async getFileInfo(path: string) {
    try {
      if (Capacitor.getPlatform() === 'web') {
        return null;
      }

      try {
        const stats = await Filesystem.stat({
          path: path,
          directory: Directory.ExternalStorage
        });
        
        return stats;
      } catch (err) {
        // If it fails, check permissions
        const hasPermissions = await this.checkStoragePermissions();
        if (!hasPermissions) {
          await this.tryAllPermissionApproaches();
        }
        return null;
      }
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }
}

export const permissionsManager = new PermissionsManager();
