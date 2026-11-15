/**
 * Build-time switches and Travis's placeholder decisions.
 * No secrets live in the app — ever (PLAN.md §1.6).
 */
export const env = {
  appName: 'Cali Valley',
  welcomeLine: 'We design the spec and come up with all the options.',
  /**
   * Skia horizon shader. [CONFIRM: installable in Expo Go on SDK 58]
   * Off until confirmed: the LinearGradient + opacity horizon is used on
   * phone, tablet and web. Flip only once @shopify/react-native-skia is
   * installed and verified; Stage 1 does not depend on it.
   */
  useSkiaHorizon: false,
  /** Force the gradient fallback even when Skia is enabled. */
  forceHorizonFallback: true,
  /** Data source. Stage 1 has no data; Stage 2 adds the SAMPLE repo. */
  dataSource: 'sample' as 'sample' | 'supabase',
} as const;

/** Placeholders until Travis sets the final numbers (PLAN.md §1.7f). */
export const placeholders = {
  responseTime: '2 business days',
  reopenWindow: '30 days',
  retention: '2 years',
} as const;

/** Live consultant limits (used from Stage 4). */
export const consultantLimits = {
  turnsPerUserPerDay: 60,
  /** [LLM DAILY CAP] — studio-wide; set by Travis. */
  studioDailyCap: null as number | null,
  fallback: 'simulated' as const,
} as const;
