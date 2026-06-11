import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import LandingPage from './signin/LandingPage';
import SignInPage from './signin/SignInPage';
import SignUpPage from './signin/SignUpPage';
import AccountCreatedPage from './signup/AccountCreatedPage';
import OTPVerificationPage from './signup/OTPVerificationPage';
import PermissionRequestPage from './signup/PermissionRequestPage';
import PersonalDetailsPage from './signup/PersonalDetailsPage';

type ScreenKey =
  | 'LandingPage'
  | 'SignInPage'
  | 'SignUpPage'
  | 'OTPVerificationPage'
  | 'PersonalDetailsPage'
  | 'PermissionRequestPage'
  | 'AccountCreatedPage';

const SCREEN_GROUPS = [
  {
    folder: 'signin/',
    screens: [
      { key: 'LandingPage' as ScreenKey, label: 'Landing Page' },
      { key: 'SignInPage' as ScreenKey, label: 'Sign In' },
      { key: 'SignUpPage' as ScreenKey, label: 'Sign Up' },
    ],
  },
  {
    folder: 'signup/',
    screens: [
      { key: 'OTPVerificationPage' as ScreenKey, label: 'OTP Verification' },
      { key: 'PersonalDetailsPage' as ScreenKey, label: 'Personal Details' },
      { key: 'PermissionRequestPage' as ScreenKey, label: 'Permission Request' },
      { key: 'AccountCreatedPage' as ScreenKey, label: 'Account Created' },
    ],
  },
];

function renderScreen(key: ScreenKey, onBack: () => void) {
  switch (key) {
    case 'LandingPage':
      return <LandingPage />;
    case 'SignInPage':
      return <SignInPage onBack={onBack} />;
    case 'SignUpPage':
      return <SignUpPage onSignIn={onBack} />;
    case 'OTPVerificationPage':
      return <OTPVerificationPage />;
    case 'PersonalDetailsPage':
      return <PersonalDetailsPage />;
    case 'PermissionRequestPage':
      return <PermissionRequestPage />;
    case 'AccountCreatedPage':
      return <AccountCreatedPage />;
  }
}

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const [activeScreen, setActiveScreen] = useState<ScreenKey | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  if (activeScreen) {
    return (
      <View style={styles.screenWrap}>
        {renderScreen(activeScreen, () => setActiveScreen(null))}
        {/* Floats above the screen so full-screen overlays can't block it */}
        <SafeAreaView style={styles.backOverlay} pointerEvents="box-none">
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.backgroundElement }]}
            onPress={() => setActiveScreen(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.backBtnText, { color: theme.text }]}>← Back to Explore</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.titleContainer}>
            <ThemedView style={styles.titleRow}>
              <ThemedText type="subtitle">Explore</ThemedText>
              <TouchableOpacity
                style={[styles.gearBtn, { backgroundColor: theme.backgroundElement }]}
                onPress={() => setPanelOpen(v => !v)}
                activeOpacity={0.7}
              >
                <SymbolView
                  tintColor={theme.text}
                  name={{ ios: 'gear', android: 'settings', web: 'settings' }}
                  size={20}
                />
              </TouchableOpacity>
            </ThemedView>
            <ThemedText style={styles.centerText} themeColor="textSecondary">
              This starter app includes example{'\n'}code to help you get started.
            </ThemedText>

            <ExternalLink href="https://docs.expo.dev" asChild>
              <Pressable style={({ pressed }) => pressed && styles.pressed}>
                <ThemedView type="backgroundElement" style={styles.linkButton}>
                  <ThemedText type="link">Expo documentation</ThemedText>
                  <SymbolView
                    tintColor={theme.text}
                    name={{ ios: 'arrow.up.right.square', android: 'link', web: 'link' }}
                    size={12}
                  />
                </ThemedView>
              </Pressable>
            </ExternalLink>
          </ThemedView>

          <ThemedView style={styles.sectionsWrapper}>
            <Collapsible title="File-based routing">
              <ThemedText type="small">
                This app has two screens: <ThemedText type="code">src/app/index.tsx</ThemedText> and{' '}
                <ThemedText type="code">src/app/explore.tsx</ThemedText>
              </ThemedText>
              <ThemedText type="small">
                The layout file in <ThemedText type="code">src/app/_layout.tsx</ThemedText> sets up
                the tab navigator.
              </ThemedText>
              <ExternalLink href="https://docs.expo.dev/router/introduction">
                <ThemedText type="linkPrimary">Learn more</ThemedText>
              </ExternalLink>
            </Collapsible>

            <Collapsible title="Android, iOS, and web support">
              <ThemedView type="backgroundElement" style={styles.collapsibleContent}>
                <ThemedText type="small">
                  You can open this project on Android, iOS, and the web. To open the web version,
                  press <ThemedText type="smallBold">w</ThemedText> in the terminal running this
                  project.
                </ThemedText>
                <Image
                  source={require('@/assets/images/tutorial-web.png')}
                  style={styles.imageTutorial}
                />
              </ThemedView>
            </Collapsible>

            <Collapsible title="Images">
              <ThemedText type="small">
                For static images, you can use the <ThemedText type="code">@2x</ThemedText> and{' '}
                <ThemedText type="code">@3x</ThemedText> suffixes to provide files for different
                screen densities.
              </ThemedText>
              <Image source={require('@/assets/images/react-logo.png')} style={styles.imageReact} />
              <ExternalLink href="https://reactnative.dev/docs/images">
                <ThemedText type="linkPrimary">Learn more</ThemedText>
              </ExternalLink>
            </Collapsible>

            <Collapsible title="Light and dark mode components">
              <ThemedText type="small">
                This template has light and dark mode support. The{' '}
                <ThemedText type="code">useColorScheme()</ThemedText> hook lets you inspect what the
                user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
              </ThemedText>
              <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
                <ThemedText type="linkPrimary">Learn more</ThemedText>
              </ExternalLink>
            </Collapsible>

            <Collapsible title="Animations">
              <ThemedText type="small">
                This template includes an example of an animated component. The{' '}
                <ThemedText type="code">src/components/ui/collapsible.tsx</ThemedText> component uses
                the powerful <ThemedText type="code">react-native-reanimated</ThemedText> library to
                animate opening this hint.
              </ThemedText>
            </Collapsible>
          </ThemedView>
          {Platform.OS === 'web' && <WebBadge />}
        </ThemedView>
      </ScrollView>

      {/* ── Gear panel overlay ── */}
      {panelOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setPanelOpen(false)}
        >
          <View
            style={[styles.panel, { backgroundColor: theme.background }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.panelTitle, { color: theme.text }]}>Screens</Text>
            {SCREEN_GROUPS.map(group => (
              <View key={group.folder}>
                <Text style={[styles.folderLabel, { color: theme.textSecondary }]}>
                  {group.folder}
                </Text>
                {group.screens.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.screenBtn, { backgroundColor: theme.backgroundElement }]}
                    onPress={() => { setActiveScreen(key); setPanelOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.screenBtnText, { color: theme.text }]}>{label}</Text>
                    <Text style={[styles.screenBtnArrow, { color: theme.textSecondary }]}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  gearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: { textAlign: 'center' },
  pressed: { opacity: 0.7 },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: { alignItems: 'center' },
  imageTutorial: {
    width: '100%',
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  // ── Gear panel ──────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  panel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 12,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  folderLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 4,
  },
  screenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  screenBtnText: {
    fontSize: 15,
    fontWeight: '500',
  },
  screenBtnArrow: {
    fontSize: 20,
    lineHeight: 22,
  },
  // ── Full-screen view ─────────────────────────────────────
  screenWrap: { flex: 1 },
  backOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    pointerEvents: 'box-none',
  },
  backBtn: {
    margin: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
