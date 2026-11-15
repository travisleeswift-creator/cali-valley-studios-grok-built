/**
 * Welcome — layout (1).
 * Phone: horizon top 55 % (40 % on phones ≤ 667 pt tall), title and two
 * actions in the bottom 45 %. Tablet / web: horizon left half, actions right.
 * One of the three screens allowed the horizon gradient.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HorizonHero, HorizonMark } from '../src/components/Horizon';
import { Banner, Button, Enter, OfflineBanner, T, Tag } from '../src/components/ui';
import { env } from '../src/lib/env';
import { useWidthClass } from '../src/lib/useWidthClass';
import { color, layout, space } from '../src/theme/tokens';

export default function Welcome() {
  const router = useRouter();
  const { isCompact, isExpanded, isMedium, landscape, shortPhone, gutter, largeText } = useWidthClass();
  const [notYet, setNotYet] = useState(false);
  const split = isExpanded || (isMedium && landscape);

  const actions = (
    <View style={[st.actions, largeText && st.actionsLarge]}>
      <Enter delay={60}>
        <T variant={split ? 'display40' : 'display30'} accessibilityRole="header">
          {env.welcomeLine}
        </T>
      </Enter>
      <Enter delay={120} style={st.buttons}>
        <Button label="Start my brief" icon="arrow-right" onPress={() => setNotYet(true)} />
        <Button label="See the design system" variant="secondary" onPress={() => router.push('/design')} />
      </Enter>
      {notYet ? (
        <View style={st.notYet}>
          <Tag kind="tbd" />
          <Banner text="The questionnaire arrives in Stage 3. Stage 1 is the design system." action="OK" onAction={() => setNotYet(false)} />
        </View>
      ) : null}
    </View>
  );

  if (split) {
    return (
      <SafeAreaView style={st.root} edges={['top', 'bottom', 'left', 'right']}>
        <View style={st.row}>
          <HorizonHero style={st.half} lineAt={0.62}>
            <View style={[st.markTop, { padding: space.s32 }]}>
              <HorizonMark />
            </View>
          </HorizonHero>
          <View style={[st.half, st.rightPane, { paddingHorizontal: space.s48 }]}>
            <View style={st.rightInner}>
              <OfflineBanner />
              {actions}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const heroShare = shortPhone ? 0.4 : 0.55;
  return (
    <SafeAreaView style={st.root} edges={['bottom', 'left', 'right']}>
      <HorizonHero style={{ flex: heroShare }} lineAt={0.7}>
        <SafeAreaView edges={['top']} style={{ paddingHorizontal: gutter, paddingTop: space.s16 }}>
          <HorizonMark />
        </SafeAreaView>
      </HorizonHero>
      <ScrollView style={{ flex: 1 - heroShare }} contentContainerStyle={[st.bottom, { paddingHorizontal: gutter }]}>
        <View style={[st.column, !isCompact && st.columnCentred]}>
          <OfflineBanner />
          {actions}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.ground },
  row: { flex: 1, flexDirection: 'row' },
  half: { flex: 1 },
  markTop: { position: 'absolute', top: 0, left: 0 },
  rightPane: { justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: color.hairline },
  rightInner: { width: '100%', maxWidth: layout.contentMax, gap: space.s24 },
  bottom: { flexGrow: 1, justifyContent: 'flex-end', paddingTop: space.s16, paddingBottom: space.s24 },
  column: { width: '100%', gap: space.s16 },
  columnCentred: { maxWidth: layout.contentMax, alignSelf: 'center' },
  actions: { gap: space.s32 },
  actionsLarge: { gap: space.s24 },
  buttons: { gap: space.s12 },
  notYet: { gap: space.s8 },
});
