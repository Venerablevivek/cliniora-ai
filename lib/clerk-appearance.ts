/**
 * Light-touch theming for Clerk's pre-built components: brand colour, radius and font only.
 * Typed loosely so we don't depend on Clerk's internal appearance types.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#2563EB",
    colorForeground: "#0F172A",
    colorMutedForeground: "#64748B",
    colorBackground: "#FFFFFF",
    colorDanger: "#DC2626",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
  },
  elements: {
    cardBox: "shadow-soft border border-line rounded-3xl",
  },
} as const;
