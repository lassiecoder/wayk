/**
 * Color tokens reused across 2+ screens, audited from the values already
 * in use — no new colors introduced. Screen-specific decorative/one-off
 * colors (illustration gradients, referral-source brand icons, mission
 * palettes used in exactly one place) are intentionally left inline.
 */
export const Colors = {
  black: '#000000',
  white: '#FFFFFF',
  background: '#F6F6F8',
  mutedText: '#8A8A8E',
  subtleText: '#3A3A3C',
  accent: '#E7A845',
  darkText: '#1A1A1A',

  border: '#D8D8DC',
  borderLight: '#E5E5E7',
  divider: '#EDEDEF',
  placeholder: '#C7C7CC',
  tertiaryText: '#B0B0B4',
  iconGray: '#4A4A4C',

  success: '#3FAE7A',
  successAlt: '#34C759',

  spectrumRed: '#E8524F',
  spectrumOrange: '#F0A83B',
  spectrumYellow: '#C9CB4A',

  sunCore: '#FFD24D',
  sunEdge: '#FFA733',
  sunGlowStart: '#FFC15C',
  sunGlowMid: '#FFB347',

  missionPurple: '#5B5FC7',
  missionBrown: '#C4762B',
  lockBrown: '#6B4A34',
} as const;
