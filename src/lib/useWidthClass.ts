import { PixelRatio, useWindowDimensions } from 'react-native';
import { largeTextFrom, layout } from '../theme/tokens';

export type WidthClass = 'compact' | 'medium' | 'expanded';

export function widthClassFor(width: number): WidthClass {
  if (width >= layout.expandedFrom) return 'expanded';
  if (width >= layout.mediumFrom) return 'medium';
  return 'compact';
}

/** compact < 600 pt · medium 600–839 · expanded ≥ 840 (two panes). */
export function useWidthClass() {
  const { width, height, fontScale } = useWindowDimensions();
  const widthClass = widthClassFor(width);
  const scale = fontScale || PixelRatio.getFontScale();
  return {
    widthClass,
    width,
    height,
    isCompact: widthClass === 'compact',
    isMedium: widthClass === 'medium',
    isExpanded: widthClass === 'expanded',
    landscape: width > height,
    /** Phones 667 pt tall or less. */
    shortPhone: widthClass === 'compact' && height <= layout.shortPhoneMaxHeight,
    gutter: width < layout.narrowBelow ? layout.gutterNarrow : layout.gutter,
    fontScale: scale,
    /** At 160 % text, footer buttons stack and chips wrap. */
    largeText: scale >= largeTextFrom,
  };
}
