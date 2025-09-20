// ONLY 5 usul.ai colors - NO OTHER COLORS ALLOWED
export const colors = {
  background: '#FFFFFF',      // Main light background (usul.ai uses light theme)
  surface: '#F8F9FA',         // Light cards and surfaces  
  accent: '#C4906C',          // Golden accent/action color (usul.ai brand color)
  textPrimary: '#1A1F29',     // Dark text on light backgrounds
  textSecondary: '#6B7280',   // Secondary gray text
};

// Semantic mapping using ONLY the 5 colors above
export const theme = {
  background: colors.background,      // Light main background
  surface: colors.surface,            // Light surface
  accent: colors.accent,              // Golden accent
  primary: colors.textPrimary,        // Dark text
  secondary: colors.textSecondary,    // Gray text
  // Map everything else to the 5 core colors for proper hierarchy
  muted: colors.textSecondary,        // Gray for muted text
  border: '#E5E7EB',                  // Light border using surface tone
  input: colors.background,           // White input backgrounds
  accentPressed: colors.accent,       // Same accent for pressed
  // Special mappings for sidebar (dark area)
  sidebarBg: '#1A1F29',              // Dark sidebar background
  sidebarText: '#FFFFFF',             // White text on dark sidebar
  sidebarSecondary: '#A8B3C1',        // Light gray text on dark sidebar
};