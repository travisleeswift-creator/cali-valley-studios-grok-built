/**
 * Cali Valley UI kit — every component follows the four-state rule
 * (PLAN.md §2 "COMPONENT STATES"). Colours, sizes and gaps come only from tokens.
 */
import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';
import { nativeDriver } from '../lib/motion';
import { useHaptic, useReducedMotion } from '../lib/prefs';
import { useOnline } from '../lib/useOnline';
import { useWidthClass } from '../lib/useWidthClass';
import { color, ColorRole, layout, maxFontScale, motion, radius, size, space, type, TypeRole } from '../theme/tokens';
import { HorizonPulse } from './Horizon';

/** The four states every list, thread, form and card ships. */
export type UIState = 'empty' | 'loading' | 'error' | 'success';

/* ───────────────────────────── Text & icon ───────────────────────────── */

export function T({
  variant = 'body16',
  tone = 'text',
  style,
  ...rest
}: TextProps & { variant?: TypeRole; tone?: ColorRole }) {
  return (
    <Text
      maxFontSizeMultiplier={maxFontScale}
      {...rest}
      style={[type[variant], { color: color[tone] }, style]}
    />
  );
}

export type IconName = React.ComponentProps<typeof Feather>['name'];

/** One outlined set (Feather) at 24 pt in text-muted. No emoji as interface. */
export function Icon({ name, tone = 'textMuted', size: s = size.icon }: { name: IconName; tone?: ColorRole; size?: number }) {
  return <Feather name={name} size={s} color={color[tone]} accessibilityElementsHidden importantForAccessibility="no" />;
}

/* ───────────────────────────── Motion helpers ───────────────────────────── */

/** Enter: 260 ms fade + 12 pt rise. Reduced motion: 160 ms cross-fade. */
export function Enter({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: reduced ? motion.reducedMs : motion.enterMs,
      delay: reduced ? 0 : delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    }).start();
  }, [v, reduced, delay]);
  const translateY = reduced ? 0 : v.interpolate({ inputRange: [0, 1], outputRange: [motion.enterRise, 0] });
  return <Animated.View style={[style, { opacity: v, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

function usePressSpring() {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const to = (value: number) =>
    reduced
      ? scale.setValue(1)
      : Animated.spring(scale, { toValue: value, ...motion.press, useNativeDriver: nativeDriver }).start();
  return { scale, pressIn: () => to(motion.pressScale), pressOut: () => to(1) };
}

/* ───────────────────────────── Button ───────────────────────────── */

export type ButtonState = 'ready' | 'disabled' | 'sending' | 'done';

/**
 * Pill button, 56 pt high. States: ready · disabled (until valid) ·
 * sending ("Sending…", holds its width) · done.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  state = 'ready',
  icon,
  sendingLabel = 'Sending…',
  doneLabel = 'Done',
  style,
  accessibilityHint,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'quiet';
  state?: ButtonState;
  icon?: IconName;
  sendingLabel?: string;
  doneLabel?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}) {
  const haptic = useHaptic();
  const { scale, pressIn, pressOut } = usePressSpring();
  const [w, setW] = useState<number | undefined>();
  const inactive = state !== 'ready';
  const primary = variant === 'primary';
  const fg: ColorRole = primary ? 'onAction' : variant === 'secondary' ? 'text' : 'textMuted';
  const shown = state === 'sending' ? sendingLabel : state === 'done' ? doneLabel : label;
  const onLayout = (e: LayoutChangeEvent) => {
    if (state === 'ready' || state === 'disabled') setW(e.nativeEvent.layout.width);
  };
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={shown}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: inactive, busy: state === 'sending' }}
        disabled={inactive}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => {
          haptic('light');
          onPress?.();
        }}
        onLayout={onLayout}
        style={({ hovered }: { hovered?: boolean; pressed: boolean }) => [
          s.button,
          primary && s.buttonPrimary,
          variant === 'secondary' && s.buttonSecondary,
          variant === 'quiet' && s.buttonQuiet,
          state === 'disabled' && s.buttonDisabled,
          hovered && !inactive && (primary ? s.buttonPrimaryHover : s.buttonHover),
          state === 'sending' && w ? { width: w } : null,
        ]}
      >
        {state === 'done' ? <Icon name="check" tone={fg} size={20} /> : icon ? <Icon name={icon} tone={fg} size={20} /> : null}
        <T variant="label13" tone={fg} style={s.buttonLabel} numberOfLines={2}>
          {shown}
        </T>
      </Pressable>
    </Animated.View>
  );
}

/* ───────────────────────────── Chip ───────────────────────────── */

export type ChipState = 'off' | 'on' | 'disabled' | 'error';

/** Selectable chip. Selection haptic. Wraps in rows (see ChipRow). */
export function Chip({ label, state = 'off', onPress }: { label: string; state?: ChipState; onPress?: () => void }) {
  const haptic = useHaptic();
  const { scale, pressIn, pressOut } = usePressSpring();
  const on = state === 'on';
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityState={{ checked: on, disabled: state === 'disabled' }}
        disabled={state === 'disabled'}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => {
          haptic('selection');
          onPress?.();
        }}
        style={[s.chip, on && s.chipOn, state === 'disabled' && s.chipDisabled, state === 'error' && s.chipError]}
      >
        {on ? <Icon name="check" tone="action" size={16} /> : null}
        <T variant="label13" tone={on ? 'text' : 'textMuted'}>
          {label}
        </T>
      </Pressable>
    </Animated.View>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={s.chipRow}>{children}</View>;
}

/* ───────────────────────────── Card ───────────────────────────── */

/**
 * Card with the four states. Error keeps whatever was there and adds a
 * danger hairline, the cause in plain words and Retry. Success can pulse
 * the horizon once.
 */
export function Card({
  state = 'success',
  title,
  overline,
  children,
  emptyText = 'Nothing here yet.',
  emptyAction,
  onEmptyAction,
  errorText = 'That did not load. Your answers are safe.',
  onRetry,
  pulse = false,
  style,
}: {
  state?: UIState;
  title?: string;
  overline?: string;
  children?: React.ReactNode;
  emptyText?: string;
  emptyAction?: string;
  onEmptyAction?: () => void;
  errorText?: string;
  onRetry?: () => void;
  pulse?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  if (state === 'loading') return <SkeletonCard style={style} />;
  return (
    <View style={[s.card, state === 'error' && s.cardError, style]}>
      {state === 'success' && pulse ? <HorizonPulse /> : null}
      {overline ? <T variant="overline11" tone="textMuted">{overline}</T> : null}
      {title ? <T variant="title18">{title}</T> : null}
      {state === 'empty' ? (
        <Empty text={emptyText} action={emptyAction} onAction={onEmptyAction} bare />
      ) : state === 'error' ? (
        <View style={s.gap12}>
          <View style={s.row}>
            <Icon name="alert-circle" tone="danger" size={20} />
            <T variant="small14" tone="text" style={s.flex}>
              {errorText}
            </T>
          </View>
          <Button label="Retry" variant="secondary" icon="rotate-ccw" onPress={onRetry} style={s.selfStart} />
        </View>
      ) : (
        children
      )}
    </View>
  );
}

/* ───────────────────────────── Field ───────────────────────────── */

export type FieldState = 'empty' | 'filled' | 'error' | 'disabled';

/** Text field. Errors sit under the field; nothing typed is ever cleared. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  help,
  error,
  disabled,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  help?: string;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.gap8}>
      <T variant="label13" tone="textMuted">
        {label}
      </T>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        placeholder={placeholder}
        placeholderTextColor={color.textDim}
        multiline={multiline}
        maxFontSizeMultiplier={maxFontScale}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        selectionColor={color.action}
        style={[
          type.body16,
          s.field,
          multiline && s.fieldMulti,
          focused && s.fieldFocus,
          !!error && s.fieldError,
          disabled && s.fieldDisabled,
        ]}
      />
      {error ? (
        <View style={s.row} accessibilityLiveRegion="polite">
          <Icon name="alert-circle" tone="danger" size={16} />
          <T variant="small14" tone="danger">
            {error}
          </T>
        </View>
      ) : help ? (
        <T variant="small14" tone="textMuted">
          {help}
        </T>
      ) : null}
    </View>
  );
}

/* ───────────────────────────── Pill ───────────────────────────── */

export type PillTone = 'neutral' | 'action' | 'danger' | 'success';

/** Status pill — always carries text, never colour alone. */
export function Pill({ label, tone = 'neutral', icon }: { label: string; tone?: PillTone; icon?: IconName }) {
  const fg: ColorRole = tone === 'neutral' ? 'textMuted' : tone;
  return (
    <View style={[s.pill, tone !== 'neutral' && { borderColor: color[fg] }]}>
      {icon ? <Icon name={icon} tone={fg} size={14} /> : <View style={[s.dot, { backgroundColor: color[fg] }]} />}
      <T variant="label13" tone={fg === 'action' || fg === 'success' || fg === 'danger' ? fg : 'textMuted'}>
        {label}
      </T>
    </View>
  );
}

/* ───────────────────────────── Empty ───────────────────────────── */

/** Empty: one sentence and one action. */
export function Empty({
  text,
  action,
  onAction,
  icon = 'inbox',
  bare = false,
}: {
  text: string;
  action?: string;
  onAction?: () => void;
  icon?: IconName;
  bare?: boolean;
}) {
  return (
    <View style={[s.empty, !bare && s.emptyBox]}>
      <Icon name={icon} />
      <T variant="body16" tone="textMuted" style={s.center}>
        {text}
      </T>
      {action ? <Button label={action} variant="secondary" onPress={onAction} /> : null}
    </View>
  );
}

/* ───────────────────────────── Skeleton ───────────────────────────── */

/** Skeleton at the final size with a 1.2 s shimmer. Still under Reduce Motion. */
export function Skeleton({ width = '100%', height = 16, r = 6, style }: { width?: number | `${number}%`; height?: number; r?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const x = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);
  useEffect(() => {
    if (reduced || !w) return;
    const loop = Animated.loop(
      Animated.timing(x, { toValue: 1, duration: motion.shimmerMs, easing: Easing.inOut(Easing.ease), useNativeDriver: nativeDriver }),
    );
    loop.start();
    return () => loop.stop();
  }, [x, reduced, w]);
  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [-w * 0.6, w * 1.2] });
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[s.skeleton, { width, height, borderRadius: r }, style]}
      accessibilityLabel="Loading"
    >
      {!reduced && w ? <Animated.View style={[s.shimmer, { width: w * 0.4, transform: [{ translateX }] }]} /> : null}
    </View>
  );
}

export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.card, style]} accessibilityLabel="Loading" accessibilityRole="progressbar">
      <Skeleton width={72} height={11} />
      <Skeleton width="70%" height={18} />
      <Skeleton height={14} />
      <Skeleton width="85%" height={14} />
    </View>
  );
}

/* ───────────────────────────── Banner ───────────────────────────── */

export type BannerTone = 'info' | 'offline' | 'danger' | 'success';

export function Banner({
  tone = 'info',
  text,
  action,
  onAction,
}: {
  tone?: BannerTone;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  const icon: IconName = tone === 'offline' ? 'wifi-off' : tone === 'danger' ? 'alert-circle' : tone === 'success' ? 'check-circle' : 'info';
  const iconTone: ColorRole = tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'textMuted';
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[s.banner, tone === 'danger' && { borderColor: color.danger }, tone === 'success' && { borderColor: color.success }]}
    >
      <Icon name={icon} tone={iconTone} size={20} />
      <T variant="small14" tone={tone === 'offline' ? 'textMuted' : 'text'} style={s.flex}>
        {text}
      </T>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={12} style={s.bannerAction}>
          <T variant="label13" tone="action">
            {action}
          </T>
        </Pressable>
      ) : null}
    </View>
  );
}

export const OFFLINE_TEXT = "You're offline — your answers are saved on this phone";

/** The one offline banner. Shows itself when the device goes offline. */
export function OfflineBanner({ force = false }: { force?: boolean }) {
  const online = useOnline();
  if (online && !force) return null;
  return <Banner tone="offline" text={OFFLINE_TEXT} />;
}

/* ───────────────────────────── Tag ───────────────────────────── */

/** Deliberate placeholder: dashed action hairline, muted text. Never an empty card. */
export function Tag({ kind = 'sample', label }: { kind?: 'sample' | 'tbd'; label?: string }) {
  return (
    <View style={s.tag} accessibilityLabel={label ?? (kind === 'sample' ? 'Sample' : 'To be added')}>
      <T variant="overline11" tone="textMuted">
        {label ?? (kind === 'sample' ? 'SAMPLE' : 'To be added')}
      </T>
    </View>
  );
}

/* ───────────────────────────── Bits ───────────────────────────── */

export function Divider() {
  return <View style={s.divider} />;
}

export function Section({ title, overline, children }: { title: string; overline?: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      {overline ? <T variant="overline11" tone="textMuted">{overline}</T> : null}
      <T variant="display22" accessibilityRole="header">
        {title}
      </T>
      {children}
    </View>
  );
}

/** Rows that stack when text is large (160 %) or the screen is narrow. */
export function Row({ children, gap = space.s12, wrap = false }: { children: React.ReactNode; gap?: number; wrap?: boolean }) {
  const { largeText } = useWidthClass();
  return <View style={[{ gap }, largeText ? s.stack : s.rowWide, wrap && s.wrap]}>{children}</View>;
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  selfStart: { alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s8 },
  rowWide: { flexDirection: 'row', alignItems: 'center' },
  stack: { flexDirection: 'column', alignItems: 'stretch' },
  wrap: { flexWrap: 'wrap' },
  gap8: { gap: space.s8 },
  gap12: { gap: space.s12 },
  button: {
    minHeight: size.button,
    paddingHorizontal: space.s24,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s8,
  },
  buttonPrimary: { backgroundColor: color.action },
  buttonPrimaryHover: { opacity: 0.92 },
  buttonSecondary: { backgroundColor: color.raised, borderWidth: size.hairline, borderColor: color.hairline },
  buttonQuiet: { backgroundColor: 'transparent' },
  buttonHover: { borderColor: color.textDim },
  buttonDisabled: { opacity: 0.4 },
  buttonLabel: { fontSize: 16, lineHeight: 20, textAlign: 'center' },
  chip: {
    minHeight: layout.minTarget,
    paddingHorizontal: space.s16,
    borderRadius: radius.pill,
    borderWidth: size.hairline,
    borderColor: color.hairline,
    backgroundColor: color.raised,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
  },
  chipOn: { borderColor: color.action, backgroundColor: color.surface },
  chipDisabled: { opacity: 0.4 },
  chipError: { borderColor: color.danger },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s8 },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: size.hairline,
    borderColor: color.hairline,
    padding: layout.cardPadding,
    gap: space.s12,
    overflow: 'hidden',
  },
  cardError: { borderColor: color.danger },
  field: {
    minHeight: size.button,
    paddingHorizontal: space.s16,
    paddingVertical: space.s12,
    borderRadius: radius.card,
    borderWidth: size.hairline,
    borderColor: color.hairline,
    backgroundColor: color.raised,
    color: color.text,
  },
  fieldMulti: { minHeight: 112, textAlignVertical: 'top' },
  fieldFocus: { borderColor: color.action },
  fieldError: { borderColor: color.danger },
  fieldDisabled: { opacity: 0.4 },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s8,
    paddingHorizontal: space.s12,
    minHeight: 28,
    borderRadius: radius.pill,
    borderWidth: size.hairline,
    borderColor: color.hairline,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  empty: { alignItems: 'center', gap: space.s12, paddingVertical: space.s16 },
  emptyBox: {
    padding: layout.cardPadding,
    borderRadius: radius.card,
    borderWidth: size.hairline,
    borderColor: color.hairline,
    backgroundColor: color.surface,
  },
  skeleton: { backgroundColor: color.raised, overflow: 'hidden' },
  shimmer: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: color.hairline },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    padding: space.s16,
    borderRadius: radius.card,
    backgroundColor: color.raised,
    borderWidth: size.hairline,
    borderColor: color.hairline,
  },
  bannerAction: { minHeight: layout.minTarget, justifyContent: 'center' },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.s8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: size.hairline,
    borderStyle: 'dashed',
    borderColor: color.action,
  },
  divider: { height: size.hairline, backgroundColor: color.hairline },
  section: { gap: space.s16 },
});
