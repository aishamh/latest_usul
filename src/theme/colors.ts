// ONLY 5 usul.ai colors - NO OTHER COLORS ALLOWED
export const colors = {
  background: '#0F1419',      // Main background
  surface: '#1A1F29',         // Cards and surfaces  
  accent: '#C4906C',          // Accent/action color
  textPrimary: '#FFFFFF',     // Primary text
  textSecondary: '#A8B3C1',   // Secondary text
};

// Semantic mapping using ONLY the 5 colors above
export const theme = {
  background: colors.background,
  surface: colors.surface,
  accent: colors.accent,
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  // Map everything else to the 5 core colors for proper hierarchy
  muted: colors.textSecondary,        // Use secondary text for muted
  border: colors.background,          // Use background for borders (subtle contrast against surface)
  input: colors.surface,              // Use surface for inputs
  accentPressed: colors.accent,       // Use same accent for pressed state (rely on opacity for feedback)
};