/**
 * The Horizon — one line of light. It is the mark, the step progress and the
 * Golden hour send. Nothing else in the app glows.
 *
 * Renderer: LinearGradient + opacity (expo-linear-gradient), which works in
 * Expo Go and on web. The Skia shader is [CONFIRM] in the plan, so it sits
 * behind env.useSkiaHorizon and is not used by Stage 1.
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { env } from '../lib/env';
import { nativeDriver } from '../lib/motion';
import { useHaptic, useReducedMotion } from '../lib/prefs';
import { color, maxFontScale, motion, size, space, type } from '../theme/tokens';

/** Which renderer is live. Always 'gradient' until Skia is confirmed. */
export const horizonRenderer: 'skia' | 'gradient' =
  env.useSkiaHorizon && !env.forceHorizonFallback ? 'skia' : 'gradient';

const LINE = [color.signalClear, color.signal, color.action, color.signal, color.signalClear] as const;
const LINE_STOPS = [0, 0.18, 0.5, 0.82, 1] as const;
/** Progress variant: bright at the leading end. */
const LEAD = [color.signalClear, color.signal, color.action] as const;
const LEAD_STOPS = [0, 0.55, 1] as const;

/** The bare line with its glow above it. */
export function HorizonLine({
  thickness = size.horizonLine,
  glow = 48,
  intensity = 1,
  lead = false,
  style,
}: {
  lead?: boolean;
  thickness?: number;
  glow?: number;
  intensity?: number | Animated.Value | Animated.AnimatedInterpolation<number>;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View pointerEvents="none" style={[{ height: glow + thickness, justifyContent: 'flex-end' }, style]}>
      {glow > 0 ? (
        <Animated.View style={[st.glowWrap, { height: glow, opacity: intensity }]}>
          <LinearGradient
            colors={[color.signalClear, color.signalGlow]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
      <LinearGradient
        colors={lead ? LEAD : LINE}
        locations={lead ? LEAD_STOPS : LINE_STOPS}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ height: thickness }}
      />
    </Animated.View>
  );
}

/* ───────────── Use 1: the static mark (temporary logo) ───────────── */

export function HorizonMark({ width = 40, withName = true, nameSize = 18 }: { width?: number; withName?: boolean; nameSize?: number }) {
  return (
    <View style={st.markRow} accessible accessibilityRole="image" accessibilityLabel={env.appName}>
      <View style={{ width, paddingTop: 4 }}>
        <HorizonLine glow={Math.round(width * 0.3)} thickness={2} />
      </View>
      {withName ? (
        <Animated.Text
          maxFontSizeMultiplier={maxFontScale}
          style={[type.title18, { fontSize: nameSize, lineHeight: nameSize * 1.33, color: color.text }]}
        >
          {env.appName}
        </Animated.Text>
      ) : null}
    </View>
  );
}

/**
 * The hero horizon (Welcome only). Still by default; it brightens only in
 * response to the person's touch, and never under Reduce Motion.
 */
export function HorizonHero({ lineAt = 0.66, style, children }: { lineAt?: number; style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const reduced = useReducedMotion();
  const glow = useRef(new Animated.Value(0.8)).current;
  const to = (v: number) =>
    reduced ? glow.setValue(0.8) : Animated.timing(glow, { toValue: v, duration: motion.enterMs, useNativeDriver: nativeDriver }).start();
  return (
    <Pressable
      onPressIn={() => to(1)}
      onPressOut={() => to(0.8)}
      accessible={false}
      style={[st.hero, style]}
    >
      <View style={[StyleSheet.absoluteFill, { top: `${Math.round(lineAt * 100)}%` }]}>
        <LinearGradient
          colors={['rgba(255,181,71,0.06)', color.actionClear]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={[st.heroLine, { top: `${Math.round(lineAt * 100)}%` }]}>
        <HorizonLine glow={160} thickness={2} intensity={glow} style={st.heroLineInner} />
      </View>
      {children}
    </Pressable>
  );
}

/* ───────────── Use 2: step progress ───────────── */

/** The line travels as each step is answered. "Step x of N". */
export function HorizonProgress({ step, total, height = 96, showLabel = true }: { step: number; total: number; height?: number; showLabel?: boolean }) {
  const reduced = useReducedMotion();
  const p = useRef(new Animated.Value(step / total)).current;
  useEffect(() => {
    const v = Math.max(0, Math.min(1, step / total));
    if (reduced) p.setValue(v);
    else Animated.timing(p, { toValue: v, duration: motion.progressMs, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [p, step, total, reduced]);
  const width = p.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View
      style={[st.progress, { height }]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${step} of ${total}`}
      accessibilityValue={{ min: 0, max: total, now: step }}
    >
      {showLabel ? (
        <Animated.Text maxFontSizeMultiplier={maxFontScale} style={[type.label13, { color: color.textMuted }]}>
          {`Step ${step} of ${total}`}
        </Animated.Text>
      ) : null}
      <View style={st.track}>
        <Animated.View style={[st.lit, { width }]}>
          <HorizonLine lead glow={Math.min(40, height * 0.4)} thickness={2} />
        </Animated.View>
      </View>
    </View>
  );
}

/* ───────────── Use 3: Golden hour ───────────── */

/**
 * The send moment. The send has already started; this is only the show.
 * The line rises and floods the area gold for 900 ms, fades over 120 ms and
 * settles as the header line above `children` (the confirmation).
 * A tap skips it. Reduce Motion: a 160 ms cross-fade to the confirmation.
 */
export function GoldenHour({
  playing,
  onDone,
  children,
  style,
}: {
  playing: boolean;
  onDone?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const haptic = useHaptic();
  const [h, setH] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'flood' | 'settled'>('idle');
  const rise = useRef(new Animated.Value(0)).current;
  const flood = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(1)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  const finish = useCallback(() => {
    anim.current?.stop();
    rise.setValue(1);
    flood.setValue(0);
    setPhase('settled');
    Animated.timing(content, { toValue: 1, duration: motion.goldenFadeMs, useNativeDriver: nativeDriver }).start();
    onDone?.();
  }, [content, flood, rise, onDone]);

  useEffect(() => {
    if (!playing) {
      setPhase('idle');
      rise.setValue(0);
      flood.setValue(0);
      content.setValue(1);
      return;
    }
    haptic('success');
    if (reduced) {
      content.setValue(0);
      setPhase('settled');
      rise.setValue(1);
      Animated.timing(content, { toValue: 1, duration: motion.reducedMs, useNativeDriver: nativeDriver }).start(() => onDone?.());
      return;
    }
    setPhase('flood');
    content.setValue(0);
    rise.setValue(0);
    flood.setValue(0);
    anim.current = Animated.sequence([
      Animated.parallel([
        Animated.timing(rise, { toValue: 1, duration: motion.goldenFloodMs, easing: Easing.inOut(Easing.cubic), useNativeDriver: nativeDriver }),
        Animated.timing(flood, { toValue: 1, duration: motion.goldenFloodMs, easing: Easing.in(Easing.quad), useNativeDriver: nativeDriver }),
      ]),
      Animated.parallel([
        Animated.timing(flood, { toValue: 0, duration: motion.goldenFadeMs, useNativeDriver: nativeDriver }),
        Animated.timing(content, { toValue: 1, duration: motion.goldenFadeMs, useNativeDriver: nativeDriver }),
      ]),
    ]);
    anim.current.start(({ finished }) => {
      if (finished) {
        setPhase('settled');
        onDone?.();
      }
    });
    return () => anim.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, reduced]);

  const startY = h * 0.72;
  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [startY, 0] });

  return (
    <View style={[st.golden, style]} onLayout={(e) => setH(e.nativeEvent.layout.height)}>
      <Animated.View style={[st.flex, { opacity: content }]}>
        {phase !== 'idle' ? <HorizonLine glow={24} style={st.headerLine} /> : null}
        {children}
      </Animated.View>
      {phase === 'flood' ? (
        <Pressable onPress={finish} style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Skip">
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: flood }]}>
            <LinearGradient colors={[color.action, color.action, color.signal]} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View style={[st.risingLine, { transform: [{ translateY }] }]}>
            <HorizonLine glow={120} thickness={3} />
          </Animated.View>
        </Pressable>
      ) : null}
    </View>
  );
}

/** One horizon pulse — the success state. Still under Reduce Motion. */
export function HorizonPulse() {
  const reduced = useReducedMotion();
  const haptic = useHaptic();
  const o = useRef(new Animated.Value(reduced ? 0.6 : 0)).current;
  useEffect(() => {
    haptic('light');
    if (reduced) return;
    Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: motion.enterMs, useNativeDriver: nativeDriver }),
      Animated.timing(o, { toValue: 0.6, duration: motion.enterMs * 2, useNativeDriver: nativeDriver }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View pointerEvents="none" style={[st.pulse, { opacity: o }]}>
      <HorizonLine glow={0} thickness={2} />
    </Animated.View>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  glowWrap: { marginHorizontal: '12%', borderTopLeftRadius: 999, borderTopRightRadius: 999, overflow: 'hidden' },
  markRow: { flexDirection: 'row', alignItems: 'center', gap: space.s12 },
  hero: { backgroundColor: color.ground, overflow: 'hidden' },
  heroLine: { position: 'absolute', left: 0, right: 0, transform: [{ translateY: -162 }] },
  heroLineInner: { marginHorizontal: '-6%' },
  progress: { justifyContent: 'flex-end', gap: space.s12, paddingBottom: space.s12 },
  track: { height: size.horizonLine, backgroundColor: color.hairline, justifyContent: 'flex-end' },
  lit: { position: 'absolute', left: 0, bottom: 0 },
  golden: { overflow: 'hidden', backgroundColor: color.ground },
  headerLine: { marginBottom: space.s16 },
  risingLine: { position: 'absolute', left: 0, right: 0, top: -120 },
  pulse: { position: 'absolute', top: 0, left: 0, right: 0 },
});
