// Feature flags for the application

export const FEATURES = {
  // Enable Firebase authentication and database
  USE_FIREBASE: true, // Set to false to use local-only mode
  
  // Enable cloud sync via Firebase
  USE_CLOUD_SYNC: true,
  
  // Enable social auth (Google, Apple)
  USE_SOCIAL_AUTH: true,
};

// Helper to check if Firebase is enabled
export const isFirebaseEnabled = () => FEATURES.USE_FIREBASE;

// Helper to check if we're in local-only mode
export const isLocalOnlyMode = () => !FEATURES.USE_FIREBASE;

