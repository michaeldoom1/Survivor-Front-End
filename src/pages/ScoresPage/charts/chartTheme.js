// Chart colors, stepped separately for each theme against the app's own
// page backgrounds (#fff / #16171d). The categorical order is fixed: a
// contestant keeps the slot it was given, it is never re-assigned by rank.
const PALETTES = {
  light: {
    series: [
      '#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948', '#813826', '#006e97',
    ],
    standardPick: '#2a78d6',
    goldenGoose: '#eda100',
    male: '#2a78d6',
    female: '#eb6834',
    muted: '#b9b8b2',
    surface: '#ffffff',
    textPrimary: '#0b0b0b',
    textSecondary: '#52514e',
    axis: '#898781',
    grid: '#e1e0d9',
  },
  dark: {
    series: [
      '#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767', '#9e6414', '#2fa4bc',
    ],
    standardPick: '#3987e5',
    goldenGoose: '#c98500',
    male: '#3987e5',
    female: '#d95926',
    muted: '#55554f',
    surface: '#16171d',
    textPrimary: '#ffffff',
    textSecondary: '#c3c2b7',
    axis: '#898781',
    grid: '#2c2c2a',
  },
}

export const MAX_HIGHLIGHTED = PALETTES.light.series.length

// Slots 9 and 10 sit close to an earlier color (teal near blue in light mode,
// brown near gold in dark mode), so those lines also carry point markers and
// never rely on color alone.
export const SLOT_MARKERS = { 8: 'circle', 9: 'square' }

export function chartPalette(theme) {
  return PALETTES[theme === 'dark' ? 'dark' : 'light']
}
