
import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '../components/ui/sonner';
import { 
  Save, 
  Smartphone, 
  HardDrive, 
  LifeBuoy, 
  FileAudio, 
  Moon
} from 'lucide-react';
import { isNativePlatform } from '../utils/nativeBridge';

const Settings = () => {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  
  return (
    <div className="flex flex-col min-h-screen bg-samsungDark-900">
      <AppHeader 
        onSettingsClick={() => setSettingsOpen(true)} 
        onSearchClick={() => setSearchOpen(true)} 
      />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <h1 className="text-xl font-bold text-green-50 mb-4">Settings</h1>
        
        <Tabs defaultValue="recording" className="w-full">
          <TabsList className="w-full mb-4 bg-samsungDark-800 p-1">
            <TabsTrigger value="recording" className="flex-1 data-[state=active]:bg-samsungGreen-700 data-[state=active]:text-green-50">
              <FileAudio className="mr-2 h-4 w-4" />
              Recording
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex-1 data-[state=active]:bg-samsungGreen-700 data-[state=active]:text-green-50">
              <HardDrive className="mr-2 h-4 w-4" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1 data-[state=active]:bg-samsungGreen-700 data-[state=active]:text-green-50">
              <Smartphone className="mr-2 h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recording">
            <Card className="bg-samsungDark-800 border-samsungDark-600">
              <CardHeader>
                <CardTitle className="text-green-50">Recording Settings</CardTitle>
                <CardDescription>Configure how calls are recorded</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-green-100">Auto record all calls</h3>
                    <p className="text-xs text-green-300">Automatically record all incoming and outgoing calls</p>
                  </div>
                  <Switch id="auto-record" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-green-100">Exclude contacts</h3>
                    <p className="text-xs text-green-300">Don't record calls from specific contacts</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-samsungDark-700 hover:bg-samsungDark-600">
                    Manage
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-green-100">Recording quality</h3>
                  <ToggleGroup type="single" defaultValue="medium" className="justify-start">
                    <ToggleGroupItem value="low" className="bg-samsungDark-700 data-[state=on]:bg-samsungGreen-700">Low</ToggleGroupItem>
                    <ToggleGroupItem value="medium" className="bg-samsungDark-700 data-[state=on]:bg-samsungGreen-700">Medium</ToggleGroupItem>
                    <ToggleGroupItem value="high" className="bg-samsungDark-700 data-[state=on]:bg-samsungGreen-700">High</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <div className="border-t border-samsungDark-600 pt-4">
                  <Button variant="default" className="bg-samsungGreen-600 hover:bg-samsungGreen-700" onClick={() => toast.success("Recording settings saved")}>
                    Save Recording Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="storage">
            <Card className="bg-samsungDark-800 border-samsungDark-600">
              <CardHeader>
                <CardTitle className="text-green-50">Storage Settings</CardTitle>
                <CardDescription>Manage your recordings storage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-green-100">Auto delete old recordings</h3>
                    <p className="text-xs text-green-300">Automatically remove recordings older than selected period</p>
                  </div>
                  <Switch id="auto-delete" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-green-100">Auto delete after</h3>
                  <ToggleGroup type="single" defaultValue="90days" className="justify-start">
                    <ToggleGroupItem value="30days" className="bg-samsungDark-700 data-[state=on]:bg-samsungGreen-700">30 days</ToggleGroupItem>
                    <ToggleGroupItem value="90days" className="bg-samsungDark-700 data-[state=on]:bg-samsungGreen-700">90 days</ToggleGroupItem>
                    <ToggleGroupItem value="1year" className="bg-samsungDark-700 data-[state=on]:bg-samsungGreen-700">1 year</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <div className="rounded-lg bg-samsungDark-700 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-green-100">Storage used</h3>
                    <span className="text-sm text-green-300">126 MB</span>
                  </div>
                  <div className="h-2 bg-samsungDark-600 rounded-full overflow-hidden">
                    <div className="h-full bg-samsungGreen-500 w-[15%]"></div>
                  </div>
                  <p className="text-xs text-green-300 mt-2">15% of allocated storage (1 GB)</p>
                </div>
                
                <div className="border-t border-samsungDark-600 pt-4">
                  <Button variant="destructive" className="bg-red-800 hover:bg-red-700">
                    Clear All Recordings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card className="bg-samsungDark-800 border-samsungDark-600">
              <CardHeader>
                <CardTitle className="text-green-50">Appearance Settings</CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-green-100">Dark theme</h3>
                    <p className="text-xs text-green-300">Use dark mode for the app interface</p>
                  </div>
                  <Switch id="dark-theme" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-green-100">Show contact images</h3>
                    <p className="text-xs text-green-300">Display contact photos in the recording list</p>
                  </div>
                  <Switch id="show-contact-images" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-green-100">Show timestamps</h3>
                    <p className="text-xs text-green-300">Display recording timestamps in the list</p>
                  </div>
                  <Switch id="show-timestamps" defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="border-t border-samsungDark-600 pt-4">
                <Button className="w-full bg-samsungGreen-600 hover:bg-samsungGreen-700">
                  <Save className="mr-2 h-4 w-4" /> Save Appearance Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center">
          <Button variant="outline" className="bg-samsungDark-800 hover:bg-samsungDark-700">
            <LifeBuoy className="mr-2 h-4 w-4" /> Get Help
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
