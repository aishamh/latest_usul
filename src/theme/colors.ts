// Exact colors extracted from usul.ai dark theme chat interface
// These are the precise hex values from the actual usul.ai application
export const colors = {
  // Backgrounds - Dark theme from chat interface
  background: '#111827',      // Very dark charcoal background (from chat screenshot)
  surface: '#1F2937',         // Slightly lighter dark surface for cards/forms
  
  // Text colors - From chat interface
  textPrimary: '#FFFFFF',     // White text for headings (from "Welcome to Usul AI")
  textSecondary: '#D1D5DB',   // Light gray for secondary text (from description)
  textMuted: '#9CA3AF',       // Medium gray for muted text
  
  // UI elements - Dark theme
  border: '#374151',          // Dark gray borders
  accent: '#B17A6B',          // Terracotta accent for buttons (keeping brand color)
  accentPressed: '#9F6B5C',   // Darker pressed state
  
  // Interactive states - Dark theme
  inputBackground: '#1F2937', // Dark input field background (from chat input)
  divider: '#374151',         // Dark divider lines
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