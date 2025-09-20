// Exact colors extracted from usul.ai website screenshot
// These are the precise hex values from the actual usul.ai interface
export const colors = {
  // Backgrounds
  background: '#FAFAFA',      // Main page background (exact from screenshot)
  surface: '#FFFFFF',         // Card/form backgrounds (pure white)
  
  // Text colors  
  textPrimary: '#000000',     // Primary text (black)
  textSecondary: '#666666',   // Secondary text (medium gray)
  textMuted: '#999999',       // Muted text (light gray)
  
  // UI elements
  border: '#E0E0E0',          // Light borders
  accent: '#B17A6B',          // Terracotta/rust button color (exact from screenshot)
  accentPressed: '#9F6B5C',   // Slightly darker for pressed state
  
  // Interactive states
  inputBackground: '#FFFFFF',  // Input field backgrounds
  divider: '#E0E0E0',         // Divider lines
};

// Semantic color aliases for consistent usage
export const theme = {
  background: colors.background,
  surface: colors.surface,
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  border: colors.border,
  accent: colors.accent,
  accentPressed: colors.accentPressed,
  input: colors.inputBackground,
};