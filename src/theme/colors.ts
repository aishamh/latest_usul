// EXACT colors from usul.ai website - NO OTHER COLORS ALLOWED
// Extracted from the actual usul.ai academic research interface
export const colors = {
  // Main backgrounds from usul.ai dark theme
  background: '#0F1419',      // Very dark navy background (from usul.ai interface)
  surface: '#1A1F29',         // Slightly lighter surface for cards (from usul.ai)
  
  // Text colors from usul.ai interface
  textPrimary: '#FFFFFF',     // Pure white for primary text (from usul.ai headings)
  textSecondary: '#A8B3C1',   // Light blue-gray for secondary text (from usul.ai)
  textMuted: '#6B7280',       // Medium gray for muted elements (from usul.ai)
  
  // UI elements from usul.ai brand
  border: '#2D3340',          // Dark borders between sections (from usul.ai)
  accent: '#C4906C',          // Warm brown accent from usul.ai branding
  accentPressed: '#A67C5A',   // Darker pressed state of usul.ai accent
  
  // Interactive states from usul.ai
  inputBackground: '#1A1F29', // Input field background (matches surface)
  divider: '#2D3340',         // Divider lines (matches border)
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