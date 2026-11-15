/**
 * Layout primitives — Screen, TwoPane, StickyFooter. Phone, tablet and web
 * all go through these, so gutters, widths and safe areas are the same
 * everywhere. Width classes: compact < 600 · medium 600–839 · expanded ≥ 840.
 */
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWidthClass } from '../lib/useWidthClass';
import { color, layout, size, space } from '../theme/tokens';
import { OfflineBanner } from './ui';

/** Safe areas, gutters (20, or 16 under 360 wide), centred column max 560. */
export function Screen({
  children,
  scroll = true,
  maxWidth = layout.contentMax,
  footerSpace = false,
  offlineBanner = true,
  edges = ['top', 'left', 'right'],
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  /** null = full width (used inside TwoPane detail). */
  maxWidth?: number | null;
  /** Leave room for a StickyFooter. */
  footerSpace?: boolean;
  offlineBanner?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { gutter } = useWidthClass();
  const inner = (
    <View style={[st.column, { paddingHorizontal: gutter, maxWidth: maxWidth ?? undefined }, contentStyle]}>
      {offlineBanner ? <OfflineBanner /> : null}
      {children}
      {footerSpace ? <View style={{ height: layout.footerHeight + space.s16 }} /> : null}
    </View>
  );
  return (
    <SafeAreaView edges={edges} style={st.root}>
      {scroll ? (
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        <View style={st.fill}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

/**
 * Two panes at ≥ 840 pt: list 360 pt + detail. Below that, one pane at a
 * time — `compactPane` says which.
 */
export function TwoPane({
  list,
  detail,
  compactPane = 'list',
}: {
  list: React.ReactNode;
  detail: React.ReactNode;
  compactPane?: 'list' | 'detail';
}) {
  const { isExpanded } = useWidthClass();
  if (!isExpanded) return <View style={st.fill}>{compactPane === 'list' ? list : detail}</View>;
  return (
    <View style={st.twoPane}>
      <View style={st.listPane}>{list}</View>
      <View style={st.detailPane}>{detail}</View>
    </View>
  );
}

/**
 * Fixed footer inside the bottom 96 pt that rides the keyboard. Buttons sit
 * in a row; at 160 % text (or on narrow screens) they stack.
 */
export function StickyFooter({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  const { gutter, largeText } = useWidthClass();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={st.footerWrap}
      pointerEvents="box-none"
    >
      <View
        style={[
          st.footer,
          { paddingHorizontal: gutter, paddingBottom: Math.max(insets.bottom, space.s16) },
          style,
        ]}
      >
        <View style={[st.footerInner, largeText ? st.footerStack : st.footerRow]}>{children}</View>
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.ground },
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  column: { width: '100%', alignSelf: 'center', gap: layout.sectionGap, paddingVertical: space.s24 },
  twoPane: { flex: 1, flexDirection: 'row' },
  listPane: { width: layout.listPane, borderRightWidth: size.hairline, borderRightColor: color.hairline },
  detailPane: { flex: 1 },
  footerWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  footer: {
    minHeight: layout.footerHeight,
    justifyContent: 'center',
    paddingTop: space.s16,
    backgroundColor: color.ground,
    borderTopWidth: size.hairline,
    borderTopColor: color.hairline,
  },
  footerInner: { width: '100%', maxWidth: layout.contentMax, alignSelf: 'center', gap: space.s12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerStack: { flexDirection: 'column-reverse', alignItems: 'stretch' },
});
