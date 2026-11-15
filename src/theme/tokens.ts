/**
 * Cali Valley — "The Horizon" design tokens.
 * Written as ROLES, not colours. Every screen uses these and nothing else
 * (PLAN.md §2, Design & Brand summary — binding on every file).
 */
import type { TextStyle } from 'react-native';

export const color = {
  /** Flat background of every screen. */
  ground: '#0D0B10',
  /** Cards, sheets, list rows. */
  surface: '#17141C',
  /** Things sitting on a surface: fields, chips, banners. */
  raised: '#201B27',
  /** 1 pt lines. No shadows anywhere. */
  hairline: 'rgba(246,241,234,0.10)',
  text: '#F6F1EA',
  textMuted: '#B9B1A6',
  /** Icons and text at 18 pt or larger only. */
  textDim: '#8C857C',
  /** The one call to action colour. */
  action: '#FFB547',
  /** Text and icons placed on `action`. */
  onAction: '#1B1206',
  /** The horizon line and its glow only — never text. */
  signal: '#FF5E3A',
  danger: '#FF7A6B',
  success: '#5FD39A',
  /** Transparent stops used only inside the horizon gradient. */
  signalClear: 'rgba(255,94,58,0)',
  signalGlow: 'rgba(255,94,58,0.22)',
  actionClear: 'rgba(255,181,71,0)',
} as const;

export type ColorRole = keyof typeof color;

/** 4 pt base. */
export const space = {
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s24: 24,
  s32: 32,
  s48: 48,
  s64: 64,
} as const;

export const layout = {
  gutter: 20,
  /** Gutter under 360 pt wide. */
  gutterNarrow: 16,
  narrowBelow: 360,
  cardPadding: 20,
  sectionGap: 32,
  contentMax: 560,
  /** Width classes. compact < 600, medium 600–839, expanded ≥ 840. */
  mediumFrom: 600,
  expandedFrom: 840,
  /** Expanded layouts: list pane width. */
  listPane: 360,
  /** Phones at or below this height are "short". */
  shortPhoneMaxHeight: 667,
  /** Every touch target. */
  minTarget: 48,
  footerHeight: 96,
} as const;

export const radius = {
  card: 14,
  sheet: 20,
  pill: 999,
} as const;

export const size = {
  button: 56,
  icon: 24,
  hairline: 1,
  horizonLine: 2,
} as const;

export const font = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
} as const;

/** Type scale. One display size per screen. Text scales to 160 %. */
export const type = {
  display40: { fontFamily: font.display, fontSize: 40, lineHeight: 44 },
  display30: { fontFamily: font.display, fontSize: 30, lineHeight: 36 },
  display22: { fontFamily: font.display, fontSize: 22, lineHeight: 28 },
  title18: { fontFamily: font.displayMedium, fontSize: 18, lineHeight: 24 },
  body16: { fontFamily: font.body, fontSize: 16, lineHeight: 24 },
  small14: { fontFamily: font.body, fontSize: 14, lineHeight: 20 },
  label13: { fontFamily: font.bodyMedium, fontSize: 13, lineHeight: 18 },
  overline11: {
    fontFamily: font.bodySemi,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TextStyle>;

export type TypeRole = keyof typeof type;

export const maxFontScale = 1.6;
/** At or above this font scale, footer buttons stack and rows wrap. */
export const largeTextFrom = 1.3;

export const motion = {
  press: { damping: 18, stiffness: 220, mass: 1 },
  pressScale: 0.97,
  enterMs: 260,
  enterRise: 12,
  exitMs: 160,
  reducedMs: 160,
  shimmerMs: 1200,
  goldenFloodMs: 900,
  goldenFadeMs: 120,
  progressMs: 420,
} as const;
