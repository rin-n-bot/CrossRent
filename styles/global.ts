// Global design system tokens for spacing, colors, and typography
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// SCALE SYSTEM
// Responsive scale function based on 375px screen width
export const scale = (size: number) => (width / 375) * size;

// SPACING
export const SPACING = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(30),
};

// COLORS
export const COLORS = {
  primary: "#222D31",
  accent: "#AF0B01",
  textPrimary: "#222D31",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#cfd4da",
  background: "#f5f5f5",
  lightBackground: "#F0F0F0",
};

// TYPOGRAPHY
export const TYPOGRAPHY = {
  title: {
    fontSize: scale(24),
    fontWeight: "600" as const,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: scale(16),
    fontWeight: "500" as const,
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: scale(14),
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: scale(12),
    color: COLORS.textMuted,
    fontWeight: "500" as const,
  },
};

// LAYOUT TOKENS
export const LAYOUT = {
  horizontalPadding: scale(20),
  borderRadius: scale(15),
};
