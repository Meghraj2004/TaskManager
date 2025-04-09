import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from './AuthContext';

type ThemeType = 'light' | 'dark' | 'system';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  taskReminders: boolean;
  dailySummary: boolean;
}

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => Promise<void>;
  isDarkMode: boolean;
  notifications: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  toggleNotification: (key: keyof NotificationSettings) => Promise<void>;
}

const defaultNotifications: NotificationSettings = {
  email: false,
  push: false,
  taskReminders: true,
  dailySummary: false
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('light');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const { user } = useAuthContext();
  
  // Load user preferences when the user changes
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user) return;
      
      try {
        const userPrefsRef = doc(db, "userPreferences", user.uid);
        const docSnap = await getDoc(userPrefsRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.theme) {
            setThemeState(data.theme as ThemeType);
          }
          
          // Load notification settings
          if (data.notifications) {
            setNotifications({
              ...defaultNotifications,
              ...data.notifications
            });
          }
        } else {
          // Create default preferences if not exists
          await setDoc(userPrefsRef, {
            theme: 'light',
            notifications: defaultNotifications
          });
        }
      } catch (error) {
        console.error("Error loading user preferences:", error);
      }
    };
    
    loadUserPreferences();
  }, [user]);
  
  // Apply the theme to the DOM
  useEffect(() => {
    const applyTheme = () => {
      const root = window.document.documentElement;
      
      // Remove any existing theme classes
      root.classList.remove('light', 'dark');
      
      let effectiveTheme = theme;
      
      // Handle system preference
      if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      // Apply the theme class
      root.classList.add(effectiveTheme);
      
      // Update isDarkMode state
      setIsDarkMode(effectiveTheme === 'dark');
    };
    
    applyTheme();
    
    // Listen for system preference changes if theme is set to 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        applyTheme();
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [theme]);
  
  // Save theme preference to Firebase
  const setTheme = async (newTheme: ThemeType) => {
    if (!user) return;
    
    setThemeState(newTheme);
    
    try {
      const userPrefsRef = doc(db, "userPreferences", user.uid);
      await updateDoc(userPrefsRef, {
        theme: newTheme
      });
    } catch (error) {
      console.error("Error updating theme:", error);
      
      // Try to create the document if it doesn't exist
      try {
        const userPrefsRef = doc(db, "userPreferences", user.uid);
        await setDoc(userPrefsRef, {
          theme: newTheme,
          notifications
        });
      } catch (innerError) {
        console.error("Failed to create user preferences:", innerError);
      }
    }
  };
  
  // Update notification settings
  const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    if (!user) return;
    
    const updatedSettings = {
      ...notifications,
      ...settings
    };
    
    setNotifications(updatedSettings);
    
    try {
      const userPrefsRef = doc(db, "userPreferences", user.uid);
      await updateDoc(userPrefsRef, {
        notifications: updatedSettings
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      
      // Try to create the document if it doesn't exist
      try {
        const userPrefsRef = doc(db, "userPreferences", user.uid);
        await setDoc(userPrefsRef, {
          theme,
          notifications: updatedSettings
        });
      } catch (innerError) {
        console.error("Failed to create user preferences:", innerError);
      }
    }
  };
  
  // Toggle a specific notification setting
  const toggleNotification = async (key: keyof NotificationSettings) => {
    await updateNotificationSettings({
      [key]: !notifications[key]
    });
  };
  
  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        isDarkMode, 
        notifications, 
        updateNotificationSettings,
        toggleNotification
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};