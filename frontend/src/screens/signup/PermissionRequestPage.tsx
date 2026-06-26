import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../../constants/responsive';
import { useHardwareBack } from '../../hooks/useHardwareBack';

const COLORS = {
  primary: '#E8573A',
  primaryDark: '#C94428',
  black: '#111111',
  darkGray: '#333333',
  mediumGray: '#888888',
  pageBg: '#FFFFFF',
  cardBg: '#F7F7F7',
  stepActive: '#E8573A',
  stepInactive: '#F2C0B5',
  badgeBorder: '#111111',
  infoBorder: '#111111',
  pinkBack: '#FCE8E4',
};

const TOTAL_STEPS = 5;
const CURRENT_STEP = 4;

// ── Step Dots ─────────────────────────────────────────────────────────────────
const StepDots: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <View style={dots.row}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          dots.dot,
          i === current - 1
            ? dots.dotActive
            : i < current - 1
            ? dots.dotDone
            : dots.dotInactive,
        ]}
      />
    ))}
  </View>
);

const dots = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: { height: 10, borderRadius: 5 },
  dotActive: { width: 28, backgroundColor: COLORS.stepActive },
  dotDone: { width: 10, backgroundColor: COLORS.stepActive, opacity: 0.6 },
  dotInactive: { width: 10, backgroundColor: COLORS.stepInactive },
});

// ── Location Icon (pin) ─────────────────────────────────────────────────────
// All measurements below are internal to this self-contained glyph (not page
// layout) — they describe a pin shape relative to its own box, so the whole
// icon is scaled as one unit via `unitScale` rather than using fixed offsets
// that would misalign relative to the surrounding card on other screen sizes.
const LocationIcon: React.FC<{ unitScale: (size: number) => number }> = ({ unitScale }) => {
  const box = unitScale(44);
  return (
    <View style={[icon.wrap, { width: box, height: box }]}>
      <View
        style={[
          icon.pinBody,
          {
            width: unitScale(26),
            height: unitScale(26),
            borderRadius: unitScale(13),
            borderWidth: unitScale(2.5),
            top: unitScale(2),
          },
        ]}
      />
      <View
        style={[
          icon.pinTip,
          {
            width: unitScale(2.5),
            height: unitScale(10),
            bottom: unitScale(2),
            borderRadius: unitScale(2),
          },
        ]}
      />
      <View
        style={[
          icon.pinHole,
          {
            width: unitScale(8),
            height: unitScale(8),
            borderRadius: unitScale(4),
            top: unitScale(13),
          },
        ]}
      />
    </View>
  );
};

const icon = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBody: {
    borderColor: COLORS.black,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  pinTip: {
    backgroundColor: COLORS.black,
    position: 'absolute',
  },
  pinHole: {
    backgroundColor: COLORS.black,
    position: 'absolute',
  },
});

// ── Bell Icon ───────────────────────────────────────────────────────────────
// Same approach as LocationIcon: a self-contained glyph scaled as one unit.
const BellIcon: React.FC<{ unitScale: (size: number) => number }> = ({ unitScale }) => {
  const box = unitScale(44);
  return (
    <View style={[bell.wrap, { width: box, height: box }]}>
      <View
        style={[
          bell.body,
          {
            width: unitScale(26),
            height: unitScale(22),
            borderTopLeftRadius: unitScale(13),
            borderTopRightRadius: unitScale(13),
            borderWidth: unitScale(2.5),
            top: unitScale(6),
          },
        ]}
      />
      <View
        style={[
          bell.top,
          {
            width: unitScale(6),
            height: unitScale(6),
            borderRadius: unitScale(3),
            borderWidth: unitScale(2.5),
            top: unitScale(3),
          },
        ]}
      />
      <View
        style={[
          bell.clapper,
          {
            width: unitScale(8),
            height: unitScale(4),
            borderBottomLeftRadius: unitScale(4),
            borderBottomRightRadius: unitScale(4),
            borderWidth: unitScale(2.5),
            bottom: unitScale(4),
          },
        ]}
      />
    </View>
  );
};

const bell = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    borderBottomWidth: 0,
    borderColor: COLORS.black,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  top: {
    borderColor: COLORS.black,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  clapper: {
    borderTopWidth: 0,
    borderColor: COLORS.black,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
});

// ── Permission Card ───────────────────────────────────────────────────────────
interface PermissionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PermissionCard: React.FC<PermissionCardProps & { iconBoxSize: number }> = ({
  icon: IconEl,
  title,
  description,
  iconBoxSize,
}) => (
  <View style={card.wrap}>
    <View style={[card.iconCol, { width: iconBoxSize, height: iconBoxSize }]}>{IconEl}</View>
    <View style={card.textCol}>
      <View style={card.titleRow}>
        <Text style={card.title}>{title}</Text>
        <View style={card.badge}>
          <Text style={card.badgeText}>Required</Text>
        </View>
      </View>
      <Text style={card.description}>{description}</Text>
    </View>
  </View>
);

const card = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: 'flex-start',
    gap: 14,
  },
  iconCol: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  textCol: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  badge: {
    borderWidth: 1,
    borderColor: COLORS.badgeBorder,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, color: COLORS.black, fontWeight: '500' },
  description: {
    fontSize: 13,
    color: COLORS.mediumGray,
    lineHeight: 19,
  },
});

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  onContinue?: (granted: { location: boolean; notifications: boolean }) => void;
  onBack?: () => void;
}

const PermissionRequestPage: React.FC<Props> = ({ onContinue, onBack }) => {
  const { moderateScale, isTablet } = useResponsive();
  const iconBoxSize = moderateScale(44);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const [requesting, setRequesting] = useState(false);

  useHardwareBack(() => {
    if (!onBack) return false;
    onBack();
    return true;
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleAllow = async () => {
    setRequesting(true);
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      const locationGranted = locationStatus === 'granted';
      if (locationGranted) {
        await Location.requestBackgroundPermissionsAsync();
      }

      let notificationsGranted = false;
      try {
        // dynamic import: expo-notifications throws on Android in Expo Go just by
        // being imported, so it can't be a static top-level import (SDK 53+)
        const Notifications = await import('expo-notifications');
        const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
        notificationsGranted = notificationStatus === 'granted';
      } catch {
        // not available in Expo Go - continue without notification permission
      }

      onContinue?.({ location: locationGranted, notifications: notificationsGranted });
    } finally {
      setRequesting(false);
    }
  };

  const handleBack = () => {
    onBack?.();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.inner,
            isTablet && styles.innerTablet,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* ── Header row ── */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={[
                styles.backBtn,
                { width: moderateScale(40), height: moderateScale(40) },
              ]}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={[styles.backArrow, { fontSize: moderateScale(26) }]}>‹</Text>
            </TouchableOpacity>
          </View>

          {/* ── Heading ── */}
          <View style={styles.headingBlock}>
            <Text style={[styles.title, { fontSize: moderateScale(26) }]}>Permission Request</Text>
            <Text style={styles.subtitle}>The app can't protect you without these</Text>
          </View>

          {/* ── Step progress ── */}
          <View style={styles.stepsBlock}>
            <StepDots current={CURRENT_STEP} total={TOTAL_STEPS} />
            <Text style={styles.stepLabel}>
              Step {CURRENT_STEP} of {TOTAL_STEPS}: Phone number
            </Text>
          </View>

          {/* ── Permission cards ── */}
          <PermissionCard
            icon={<LocationIcon unitScale={moderateScale} />}
            title="Location- Always On"
            description="Needed to dispatch responders to you instantly"
            iconBoxSize={iconBoxSize}
          />
          <PermissionCard
            icon={<BellIcon unitScale={moderateScale} />}
            title="Notifications"
            description="Get alerts when help is on the way"
            iconBoxSize={iconBoxSize}
          />

          {/* ── Info note ── */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              You'll see the system permission dialogs after tapping Allow
            </Text>
          </View>

          {/* ── Allow & Continue ── */}
          <TouchableOpacity
            style={[styles.btnPrimary, requesting && styles.btnDisabled]}
            onPress={handleAllow}
            activeOpacity={0.85}
            disabled={requesting}
          >
            <Text style={styles.btnPrimaryText}>
              {requesting ? 'Requesting...' : 'Allow & Continue'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PermissionRequestPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 48 },
  innerTablet: { paddingHorizontal: 64, alignSelf: 'center', width: '100%', maxWidth: 600 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.pinkBack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 26, color: COLORS.primary, lineHeight: 30, marginTop: -2 },

  headingBlock: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.black, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.mediumGray, textAlign: 'center', lineHeight: 20 },

  stepsBlock: { alignItems: 'center', marginBottom: 28 },
  stepLabel: { fontSize: 13, color: COLORS.mediumGray },

  infoBox: {
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoText: { fontSize: 13, color: COLORS.black, lineHeight: 20 },

  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
  btnDisabled: { opacity: 0.6 },
});
