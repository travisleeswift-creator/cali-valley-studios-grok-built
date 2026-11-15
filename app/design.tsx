/**
 * /design — the Stage 1 showcase. Every token, every component in its four
 * states, and the Horizon in its three uses at all three widths.
 * Expanded (≥ 840): TwoPane — section list 360 pt + detail.
 * One of the screens allowed the horizon gradient.
 */
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenHour, HorizonHero, HorizonMark, HorizonProgress, horizonRenderer } from '../src/components/Horizon';
import { Screen, StickyFooter, TwoPane } from '../src/components/layout';
import {
  Banner,
  Button,
  Card,
  Chip,
  ChipRow,
  Divider,
  Empty,
  Field,
  Icon,
  OFFLINE_TEXT,
  Pill,
  Section,
  Skeleton,
  SkeletonCard,
  T,
  Tag,
} from '../src/components/ui';
import { env, placeholders } from '../src/lib/env';
import { usePrefs } from '../src/lib/prefs';
import { useWidthClass, widthClassFor } from '../src/lib/useWidthClass';
import { color, ColorRole, layout, motion, radius, size, space, type, TypeRole } from '../src/theme/tokens';

/* ───────────── helpers ───────────── */

function StateGrid({ items }: { items: { label: string; node: React.ReactNode }[] }) {
  return (
    <View style={st.grid}>
      {items.map((it) => (
        <View key={it.label} style={st.cell}>
          <T variant="overline11" tone="textMuted">
            {it.label}
          </T>
          {it.node}
        </View>
      ))}
    </View>
  );
}

function Sub({ children }: { children: string }) {
  return <T variant="title18">{children}</T>;
}

/* ───────────── sections ───────────── */

const COLOURS: { role: ColorRole; name: string; note: string }[] = [
  { role: 'ground', name: 'ground', note: 'Every background. Flat.' },
  { role: 'surface', name: 'surface', note: 'Cards, sheets, rows' },
  { role: 'raised', name: 'raised', note: 'Fields, chips, banners' },
  { role: 'hairline', name: 'hairline', note: '1 pt lines, no shadows' },
  { role: 'text', name: 'text', note: 'Primary text' },
  { role: 'textMuted', name: 'text-muted', note: 'Secondary text, icons' },
  { role: 'textDim', name: 'text-dim', note: 'Icons and ≥ 18 pt only' },
  { role: 'action', name: 'action', note: 'The call to action' },
  { role: 'onAction', name: 'on action', note: 'Text on action' },
  { role: 'signal', name: 'signal', note: 'The line and its glow only' },
  { role: 'danger', name: 'danger', note: 'Errors' },
  { role: 'success', name: 'success', note: 'Done' },
];

const TYPES: { role: TypeRole; spec: string }[] = [
  { role: 'display40', spec: 'Space Grotesk 700 · 40/44' },
  { role: 'display30', spec: 'Space Grotesk 700 · 30/36' },
  { role: 'display22', spec: 'Space Grotesk 700 · 22/28' },
  { role: 'title18', spec: 'Space Grotesk 500 · 18/24' },
  { role: 'body16', spec: 'Inter · 16/24 body' },
  { role: 'small14', spec: 'Inter · 14/20 small' },
  { role: 'label13', spec: 'Inter · 13/18 label' },
  { role: 'overline11', spec: 'Inter · 11/16 overline +1.6' },
];

function Tokens() {
  return (
    <Section overline="Stage 1 · tokens.ts" title="Tokens">
      <Sub>Colour roles</Sub>
      <View style={st.grid}>
        {COLOURS.map((c) => (
          <View key={c.role} style={st.swatchCell}>
            <View style={[st.swatch, { backgroundColor: color[c.role] }]} />
            <T variant="label13">{c.name}</T>
            <T variant="small14" tone="textMuted">
              {color[c.role]}
            </T>
            <T variant="small14" tone="textMuted">
              {c.note}
            </T>
          </View>
        ))}
      </View>
      <Divider />
      <Sub>Type scale (scales to 160 %)</Sub>
      <View style={st.gap16}>
        {TYPES.map((t) => (
          <View key={t.role} style={st.gap4}>
            <T variant={t.role} numberOfLines={1}>
              {t.role.startsWith('overline') ? 'Overline label' : 'Cali Valley'}
            </T>
            <T variant="small14" tone="textMuted">
              {t.spec}
            </T>
          </View>
        ))}
      </View>
      <Divider />
      <Sub>Spacing — 4 pt base</Sub>
      <View style={st.gap8}>
        {Object.entries(space).map(([k, v]) => (
          <View key={k} style={st.rowC}>
            <T variant="label13" tone="textMuted" style={st.specKey}>
              {v}
            </T>
            <View style={{ width: v * 3, height: 8, backgroundColor: color.raised, borderRadius: 2 }} />
          </View>
        ))}
        <T variant="small14" tone="textMuted">
          {`Gutters ${layout.gutter} (${layout.gutterNarrow} under ${layout.narrowBelow} wide) · card padding ${layout.cardPadding} · section gap ${layout.sectionGap} · content max ${layout.contentMax}`}
        </T>
      </View>
      <Divider />
      <Sub>Shape and motion</Sub>
      <View style={st.rowWrap}>
        <View style={[st.shape, { borderRadius: radius.card }]}>
          <T variant="label13" tone="textMuted">{`Card ${radius.card}`}</T>
        </View>
        <View style={[st.shape, { borderRadius: radius.sheet }]}>
          <T variant="label13" tone="textMuted">{`Sheet ${radius.sheet}`}</T>
        </View>
        <View style={[st.shape, { borderRadius: radius.pill, height: size.button }]}>
          <T variant="label13" tone="textMuted">{`Pill ${size.button} pt`}</T>
        </View>
      </View>
      <T variant="small14" tone="textMuted">
        {`Press spring damping ${motion.press.damping} / stiffness ${motion.press.stiffness} · enter ${motion.enterMs} ms fade + ${motion.enterRise} pt rise · exit ${motion.exitMs} ms · reduced motion ${motion.reducedMs} ms cross-fade, still horizon · shimmer ${motion.shimmerMs / 1000} s · hairlines, no shadows · no sound.`}
      </T>
      <Sub>Icons — one outlined set, 24 pt, text-muted</Sub>
      <View style={st.rowWrap}>
        {(['home', 'message-circle', 'file-text', 'inbox', 'alert-circle', 'check-circle', 'wifi-off', 'paperclip', 'user', 'settings'] as const).map((n) => (
          <Icon key={n} name={n} />
        ))}
      </View>
    </Section>
  );
}

function Components() {
  const [name, setName] = useState('');
  const [chips, setChips] = useState<string[]>(['Takeaway']);
  const toggle = (c: string) => setChips((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]));
  const [cardState, setCardState] = useState<'error' | 'success'>('error');
  return (
    <Section overline="Stage 1 · ui.tsx" title="Components — four states each">
      <Sub>Button</Sub>
      <StateGrid
        items={[
          { label: 'Ready', node: <Button label="Continue" /> },
          { label: 'Disabled until valid', node: <Button label="Continue" state="disabled" /> },
          { label: 'Sending (holds width)', node: <Button label="Request my free quote" state="sending" /> },
          { label: 'Done', node: <Button label="Continue" state="done" doneLabel="Sent" /> },
        ]}
      />
      <StateGrid
        items={[
          { label: 'Secondary', node: <Button label="Back" variant="secondary" icon="arrow-left" /> },
          { label: 'Quiet', node: <Button label="Skip" variant="quiet" /> },
        ]}
      />
      <Sub>Chip (wraps at large text)</Sub>
      <StateGrid
        items={[
          { label: 'Off', node: <Chip label="Salon" /> },
          { label: 'On', node: <Chip label="Takeaway" state="on" /> },
          { label: 'Disabled', node: <Chip label="Trades" state="disabled" /> },
          { label: 'Error', node: <Chip label="Prefer not to say" state="error" /> },
        ]}
      />
      <ChipRow>
        {['Takeaway', 'Salon', 'Trades', 'Retail', 'Café', 'Fitness', 'Beauty', 'Clinic'].map((c) => (
          <Chip key={c} label={c} state={chips.includes(c) ? 'on' : 'off'} onPress={() => toggle(c)} />
        ))}
      </ChipRow>
      <Sub>Card</Sub>
      <StateGrid
        items={[
          { label: 'Empty', node: <Card state="empty" title="Your tickets" emptyText="No problems reported — nice" emptyAction="Report a problem" /> },
          { label: 'Loading', node: <Card state="loading" /> },
          {
            label: 'Error (tap Retry)',
            node: (
              <Card state={cardState} pulse={cardState === 'success'} overline="Brief" title="Takeaway ordering app" onRetry={() => setCardState('success')} errorText="We couldn't reach the studio. Nothing you typed is lost.">
                <T variant="small14" tone="textMuted">Retried and loaded.</T>
              </Card>
            ),
          },
          {
            label: 'Success',
            node: (
              <Card overline="Brief" title="Your brief is with Travis">
                <T variant="small14" tone="textMuted">{`We reply within ${placeholders.responseTime}.`}</T>
                <Tag kind="sample" />
              </Card>
            ),
          },
        ]}
      />
      <Sub>Field</Sub>
      <StateGrid
        items={[
          { label: 'Empty', node: <Field label="Business name" value={name} onChangeText={setName} placeholder="e.g. Rosa's Kitchen" help="As customers know it." /> },
          { label: 'Filled', node: <Field label="Business name" value="Rosa's Kitchen" /> },
          { label: 'Error (kept what was typed)', node: <Field label="Email" value="rosa@kitchen" error="That email is missing the end, like .com" /> },
          { label: 'Disabled', node: <Field label="Reference" value="CV-0000" disabled /> },
        ]}
      />
      <Sub>Pill — status, always with text</Sub>
      <StateGrid
        items={[
          { label: 'Neutral', node: <Pill label="Received" /> },
          { label: 'Action', node: <Pill label="Waiting on you" tone="action" /> },
          { label: 'Danger', node: <Pill label="Urgent · S1" tone="danger" icon="alert-triangle" /> },
          { label: 'Success', node: <Pill label="Resolved" tone="success" icon="check" /> },
        ]}
      />
      <Sub>Empty — one sentence, one action</Sub>
      <Empty text="Your brief is with Travis" action="See what happens next" icon="send" />
      <Sub>Skeleton — final shape, 1.2 s shimmer</Sub>
      <View style={st.gap12}>
        <Skeleton width="60%" height={22} />
        <Skeleton height={14} />
        <SkeletonCard />
      </View>
      <Sub>Banner</Sub>
      <View style={st.gap12}>
        <Banner tone="offline" text={OFFLINE_TEXT} />
        <Banner text="Your brief is queued and will send once you're back online." />
        <Banner tone="danger" text="That didn't send. Your answers are safe." action="Retry" />
        <Banner tone="success" text="Sent. You'll hear back within 2 business days." />
      </View>
      <Sub>Tag — deliberate placeholders</Sub>
      <View style={st.rowWrap}>
        <Tag kind="sample" />
        <Tag kind="tbd" />
        <Tag label={`Reopen window ${placeholders.reopenWindow}`} />
        <Tag label={`Retention ${placeholders.retention}`} />
      </View>
    </Section>
  );
}

/** A frame at a fixed width, showing what each width class gets. */
function WidthFrame({ w }: { w: number }) {
  const cls = widthClassFor(w);
  const [step, setStep] = useState(3);
  const [playing, setPlaying] = useState(false);
  const split = cls === 'expanded';
  return (
    <View style={[st.frame, { width: w }]}>
      <View style={st.frameHead}>
        <T variant="overline11" tone="textMuted">{`${cls} · ${w} pt`}</T>
      </View>
      <View style={st.framePad}>
        <T variant="label13" tone="textMuted">1 · Static mark</T>
        <HorizonMark width={split ? 56 : 40} />
        <T variant="label13" tone="textMuted">2 · Step progress</T>
        <HorizonProgress step={step} total={8} height={cls === 'compact' ? 64 : 96} />
        <View style={st.rowWrap}>
          <Button label="Back" variant="secondary" onPress={() => setStep((s) => Math.max(1, s - 1))} />
          <Button label="Continue" onPress={() => setStep((s) => Math.min(8, s + 1))} />
        </View>
        <T variant="label13" tone="textMuted">3 · Golden hour send (tap to skip)</T>
        <GoldenHour playing={playing} style={[st.goldenBox, split && st.goldenBoxWide]}>
          <View style={st.goldenContent}>
            {playing ? (
              <>
                <T variant="title18">Your brief is with Travis</T>
                <T variant="small14" tone="textMuted">{`We reply within ${placeholders.responseTime}.`}</T>
                <Button label="Play again" variant="secondary" onPress={() => setPlaying(false)} />
              </>
            ) : (
              <Button label="Request my free quote" onPress={() => setPlaying(true)} />
            )}
          </View>
        </GoldenHour>
      </View>
    </View>
  );
}

function HorizonSection() {
  const { width } = useWidthClass();
  return (
    <Section overline={`Stage 1 · Horizon.tsx · renderer: ${horizonRenderer}`} title="The Horizon — three uses">
      <T variant="body16" tone="textMuted">
        One line of light is the mark, the progress and the moment of sending. Nothing else glows. Golden hour: the line rises and floods gold for 900 ms, fades over 120 ms and settles as the header line. Reduce Motion gives a 160 ms cross-fade.
      </T>
      <HorizonHero style={st.heroDemo} lineAt={0.7}>
        <View style={st.heroDemoMark}>
          <HorizonMark />
        </View>
      </HorizonHero>
      <T variant="small14" tone="textMuted">{`At all three widths (your window is ${Math.round(width)} pt — ${widthClassFor(width)}). Scroll sideways.`}</T>
      <ScrollView horizontal contentContainerStyle={st.frames}>
        <WidthFrame w={360} />
        <WidthFrame w={720} />
        <WidthFrame w={960} />
      </ScrollView>
    </Section>
  );
}

function LayoutSection() {
  const { widthClass, width, height, shortPhone, gutter, fontScale, largeText } = useWidthClass();
  return (
    <Section overline="Stage 1 · layout.tsx" title="Layout primitives">
      <Card overline="useWidthClass" title={`${widthClass} · ${Math.round(width)} × ${Math.round(height)} pt`}>
        <T variant="small14" tone="textMuted">{`compact < ${layout.mediumFrom} · medium ${layout.mediumFrom}–${layout.expandedFrom - 1} · expanded ≥ ${layout.expandedFrom} (two panes, list ${layout.listPane} pt + detail).`}</T>
        <T variant="small14" tone="textMuted">{`Gutter ${gutter} · short phone ${shortPhone ? 'yes' : 'no'} · text scale ${fontScale.toFixed(2)}${largeText ? ' (large: footers stack, chips wrap)' : ''}`}</T>
      </Card>
      <Card overline="Screen" title="Safe areas, gutters, max width 560">
        <T variant="small14" tone="textMuted">This page's single column uses Screen. On expanded widths the page itself becomes a TwoPane.</T>
      </Card>
      <Card overline="StickyFooter" title="Back / Skip / Continue in the bottom 96 pt">
        <T variant="small14" tone="textMuted">Shown at the bottom of this page on compact and medium widths. It rides the keyboard and stacks at 160 % text.</T>
      </Card>
    </Section>
  );
}

function Settings() {
  const p = usePrefs();
  const [offline, setOffline] = useState(false);
  return (
    <Section overline="Preferences" title="Motion, haptics, offline">
      <SwitchRow label="Reduce motion (preview)" value={p.forceReducedMotion || p.systemReducedMotion} onChange={p.setForceReducedMotion} />
      <SwitchRow label="Haptics" value={p.hapticsOn} onChange={p.setHapticsOn} />
      <SwitchRow label="Show the offline banner" value={offline} onChange={setOffline} />
      {offline ? <Banner tone="offline" text={OFFLINE_TEXT} /> : null}
    </Section>
  );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={st.switchRow}>
      <T variant="body16" style={st.flex}>
        {label}
      </T>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: color.raised, true: color.action }}
        thumbColor={color.text}
        accessibilityLabel={label}
      />
    </View>
  );
}

const SECTIONS = [
  { id: 'tokens', title: 'Tokens', icon: 'droplet', render: () => <Tokens /> },
  { id: 'components', title: 'Components', icon: 'grid', render: () => <Components /> },
  { id: 'horizon', title: 'The Horizon', icon: 'sunrise', render: () => <HorizonSection /> },
  { id: 'layout', title: 'Layout', icon: 'layout', render: () => <LayoutSection /> },
  { id: 'prefs', title: 'Preferences', icon: 'sliders', render: () => <Settings /> },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

function Header() {
  const router = useRouter();
  return (
    <View style={st.header}>
      <Pressable accessibilityRole="link" accessibilityLabel="Back to Welcome" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={st.back} hitSlop={8}>
        <Icon name="arrow-left" />
      </Pressable>
      <HorizonMark />
      <Tag label="Stage 1" />
    </View>
  );
}

export default function DesignShowcase() {
  const { isExpanded } = useWidthClass();
  const [active, setActive] = useState<SectionId>('tokens');

  if (isExpanded) {
    const current = SECTIONS.find((x) => x.id === active) ?? SECTIONS[0];
    return (
      <SafeAreaView style={st.root} edges={['top', 'bottom', 'left', 'right']}>
        <TwoPane
          list={
            <ScrollView contentContainerStyle={st.list}>
              <Header />
              <T variant="display30">Design system</T>
              <T variant="small14" tone="textMuted">{`${env.appName} · The Horizon · Golden hour`}</T>
              <View style={st.gap4}>
                {SECTIONS.map((x) => (
                  <Pressable
                    key={x.id}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: x.id === active }}
                    onPress={() => setActive(x.id)}
                    style={[st.navItem, x.id === active && st.navItemOn]}
                  >
                    <Icon name={x.icon} tone={x.id === active ? 'action' : 'textMuted'} />
                    <T variant="body16" tone={x.id === active ? 'text' : 'textMuted'}>
                      {x.title}
                    </T>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          }
          detail={
            <Screen maxWidth={960} edges={[]}>
              {current.render()}
            </Screen>
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={st.root}>
      <Screen footerSpace>
        <Header />
        <View style={st.gap8}>
          <T variant="display30">Design system</T>
          <T variant="body16" tone="textMuted">{`${env.appName} · The Horizon · Golden hour`}</T>
        </View>
        {SECTIONS.map((x) => (
          <React.Fragment key={x.id}>{x.render()}</React.Fragment>
        ))}
      </Screen>
      <StickyFooter>
        <Button label="Back" variant="secondary" icon="arrow-left" />
        <Button label="Skip" variant="quiet" />
        <Button label="Continue" />
      </StickyFooter>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.ground },
  flex: { flex: 1 },
  gap4: { gap: space.s4 },
  gap8: { gap: space.s8 },
  gap12: { gap: space.s12 },
  gap16: { gap: space.s16 },
  rowC: { flexDirection: 'row', alignItems: 'center', gap: space.s12 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s12, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s16 },
  cell: { flexGrow: 1, flexBasis: 220, gap: space.s8 },
  swatchCell: { flexGrow: 1, flexBasis: 140, gap: space.s4 },
  swatch: { height: 56, borderRadius: radius.card, borderWidth: size.hairline, borderColor: color.hairline },
  specKey: { width: 28 },
  shape: {
    width: 120,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    borderWidth: size.hairline,
    borderColor: color.hairline,
  },
  heroDemo: { height: 220, borderRadius: radius.card, borderWidth: size.hairline, borderColor: color.hairline },
  heroDemoMark: { padding: space.s16 },
  frames: { gap: space.s16, paddingBottom: space.s8 },
  frame: { borderRadius: radius.sheet, borderWidth: size.hairline, borderColor: color.hairline, overflow: 'hidden' },
  frameHead: { paddingHorizontal: layout.gutter, paddingVertical: space.s12, borderBottomWidth: size.hairline, borderBottomColor: color.hairline, backgroundColor: color.surface },
  framePad: { padding: layout.gutter, gap: space.s16 },
  goldenBox: { height: 240, borderRadius: radius.card, borderWidth: size.hairline, borderColor: color.hairline },
  goldenBoxWide: { height: 280 },
  goldenContent: { flex: 1, padding: layout.cardPadding, gap: space.s12, justifyContent: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.s16, minHeight: layout.minTarget },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.s16 },
  back: { width: layout.minTarget, height: layout.minTarget, alignItems: 'center', justifyContent: 'center', marginLeft: -space.s12 },
  list: { padding: space.s24, gap: space.s24 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: space.s12, minHeight: layout.minTarget, paddingHorizontal: space.s12, borderRadius: radius.card },
  navItemOn: { backgroundColor: color.surface },
});

// Typography is referenced so the showcase stays in sync with tokens.
void type;
