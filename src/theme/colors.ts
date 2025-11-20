export const colors = {
  background: '#FFFFFF',      // Pure white main background to match logo circle
  surface: '#F5F5F5',         // Light gray surfaces / cards
  accent: '#A0635D',          // Reddish-brown terra cotta header color
  textPrimary: '#2D3748',     // Dark text on light backgrounds
  textSecondary: '#718096',   // Gray text
};

// Semantic mapping using ONLY the 5 colors above
export const theme = {
  background: colors.background,      // Light gray main background
  surface: colors.surface,            // Light gray surface (sidebar)
  accent: colors.accent,              // Reddish-brown accent
  primary: colors.textPrimary,        // Dark text
  secondary: colors.textSecondary,    // Gray text
  // Map everything else to the 5 core colors for proper hierarchy
  muted: colors.textSecondary,        // Gray for muted text
  border: '#E2E8F0',                  // Light border
  input: '#FFFFFF',                   // White input backgrounds
  accentPressed: colors.accent,       // Same accent for pressed
};