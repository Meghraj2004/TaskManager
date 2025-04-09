import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Try to import local config for development
let localConfig;
try {
  // This import will fail in production builds, which is okay
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  localConfig = await import('./firebase.local.js').then(m => m.localFirebaseConfig);
} catch (e) {
  // No local config available, that's fine
  localConfig = null;
}

// Function to get environment variables in a browser-safe way
function getEnvVar(name: string, defaultValue: string = ''): string {
  // For Vite/browser environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[name] || defaultValue;
  }
  return defaultValue;
}

// Use either environment variables or local config
let firebaseConfig;
if (localConfig && localConfig.apiKey) {
  // Use local config for development
  console.log("Using local Firebase configuration");
  firebaseConfig = localConfig;
} else {
  // Use environment variables (or fallbacks) for production
  firebaseConfig = {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY', ''),
    authDomain: `${getEnvVar('VITE_FIREBASE_PROJECT_ID', '')}.firebaseapp.com`,
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', ''),
    storageBucket: `${getEnvVar('VITE_FIREBASE_PROJECT_ID', '')}.appspot.com`,
    appId: getEnvVar('VITE_FIREBASE_APP_ID', '')
  };
}

// Make sure we have required Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(
    "Firebase configuration is missing. Please set Firebase configuration " +
    "in either environment variables or firebase.local.js. See documentation for details."
  );
  
  // Provide mock configuration for demo mode
  firebaseConfig = {
    apiKey: "demo-mode-api-key",
    authDomain: "demo-mode.firebaseapp.com",
    projectId: "demo-mode",
    storageBucket: "demo-mode.appspot.com",
    appId: "demo-mode-app-id"
  };
}

// Initialize Firebase with the appropriate config
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
