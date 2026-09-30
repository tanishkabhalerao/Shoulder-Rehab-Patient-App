/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#173A3A',
    tint: '#16756F',

    // Core surfaces
    background: '#F5F7F3',
    foreground: '#173A3A',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#173A3A',

    // Primary action color (buttons, links, active states)
    primary: '#16756F',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E7F0EC',
    secondaryForeground: '#28534F',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EFF3EF',
    mutedForeground: '#738681',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#E9AD75',
    accentForeground: '#5A351E',

    // Destructive actions (delete, error states)
    destructive: '#B64E4B',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#DDE6E0',
    input: '#E8EEEA',
    good: '#28765F',
    goodSurface: '#E7F3EB',
    warning: '#B9793C',
    warningSurface: '#F8EFE4',
    hero: '#153F42',
    heroSoft: '#D9E9E3',
  },

  dark: {
    text: '#EAF2EE',
    tint: '#77C8B9',
    background: '#122927',
    foreground: '#EAF2EE',
    card: '#1B3431',
    cardForeground: '#EAF2EE',
    primary: '#77C8B9',
    primaryForeground: '#102A27',
    secondary: '#263E3A',
    secondaryForeground: '#D5E9E1',
    muted: '#243734',
    mutedForeground: '#A0B7AE',
    accent: '#E9AD75',
    accentForeground: '#3E2818',
    destructive: '#E4857D',
    destructiveForeground: '#301816',
    border: '#35504B',
    input: '#2B423D',
    good: '#84C5A4',
    goodSurface: '#213E34',
    warning: '#E4AE73',
    warningSurface: '#453729',
    hero: '#163C3D',
    heroSoft: '#294743',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 20,
};

export default colors;
