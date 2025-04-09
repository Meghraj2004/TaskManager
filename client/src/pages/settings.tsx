import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [taskReminders, setTaskReminders] = useState(false);
  const [dailySummary, setDailySummary] = useState(false);
  
  const { user, loading, logout } = useAuthContext();
  const { theme, setTheme, notifications, updateNotificationSettings } = useTheme();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  // Load user settings
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setTaskReminders(notifications.taskReminders);
      setDailySummary(notifications.dailySummary);
    }
  }, [user, notifications]);

  // Show loading state or redirect if not authenticated
  if (loading || !user) {
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser!, {
        displayName: displayName
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not update your profile"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationUpdate = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await updateNotificationSettings({
        email: notifications.email,
        push: notifications.push,
        taskReminders,
        dailySummary
      });
      
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not update your preferences"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    try {
      await setTheme(newTheme);
      
      toast({
        title: "Theme updated",
        description: `Theme set to ${newTheme}.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update theme"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="text-gray-600 dark:text-gray-300 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-primary">TaskFlow</h1>
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
          {user.displayName ? getInitials(user.displayName) : "U"}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          {/* Settings Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
          </div>
          
          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleProfileUpdate}>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                        {displayName ? getInitials(displayName) : "U"}
                      </div>
                      <div>
                        <h3 className="font-medium">{displayName || "User"}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email || ""}
                        disabled
                        placeholder="Your email address"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed.</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about your tasks</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => updateNotificationSettings({ email: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications for task reminders</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => updateNotificationSettings({ push: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Task Reminders</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive reminders for upcoming tasks</p>
                    </div>
                    <Switch
                      checked={taskReminders}
                      onCheckedChange={(checked) => {
                        setTaskReminders(checked);
                        updateNotificationSettings({ taskReminders: checked });
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Summary</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive a daily summary of your tasks</p>
                    </div>
                    <Switch
                      checked={dailySummary}
                      onCheckedChange={(checked) => {
                        setDailySummary(checked);
                        updateNotificationSettings({ dailySummary: checked });
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleNotificationUpdate} disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize the look and feel of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${
                          theme === "light" ? "border-primary bg-blue-50 dark:bg-blue-900" : "border-gray-200 dark:border-gray-700"
                        }`}
                        onClick={() => handleThemeChange("light")}
                      >
                        <div className="h-12 bg-white border rounded mb-2 dark:border-gray-700"></div>
                        <div className="text-center font-medium">Light</div>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${
                          theme === "dark" ? "border-primary bg-blue-50 dark:bg-blue-900" : "border-gray-200 dark:border-gray-700"
                        }`}
                        onClick={() => handleThemeChange("dark")}
                      >
                        <div className="h-12 bg-gray-800 border rounded mb-2 dark:border-gray-700"></div>
                        <div className="text-center font-medium">Dark</div>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${
                          theme === "system" ? "border-primary bg-blue-50 dark:bg-blue-900" : "border-gray-200 dark:border-gray-700"
                        }`}
                        onClick={() => handleThemeChange("system")}
                      >
                        <div className="h-12 bg-gradient-to-r from-white to-gray-800 border rounded mb-2 dark:border-gray-700"></div>
                        <div className="text-center font-medium">System</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Account Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Manage your account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Danger Zone</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">These actions are irreversible</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button variant="outline" onClick={logout}>
                    Log Out
                  </Button>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav onOpenNewTaskModal={() => {}} />
    </div>
  );
}