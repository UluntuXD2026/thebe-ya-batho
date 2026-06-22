import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

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

// ── Location Icon (pin) ───────────────────────────────────────────────────────
const LocationIcon: React.FC = () => (
  <View style={icon.wrap}>
    <View style={icon.pinBody} />
    <View style={icon.pinTip} />
    <View style={icon.pinHole} />
  </View>
);

const icon = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBody: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: COLORS.black,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 2,
  },
  pinTip: {
    width: 2.5,
    height: 10,
    backgroundColor: COLORS.black,
    position: 'absolute',
    bottom: 2,
    borderRadius: 2,
  },
  pinHole: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.black,
    position: 'absolute',
    top: 13,
  },
});

// ── Bell Icon ─────────────────────────────────────────────────────────────────
const BellIcon: React.FC = () => (
  <View style={bell.wrap}>
    <View style={bell.body} />
    <View style={bell.top} />
    <View style={bell.clapper} />
  </View>
);

const bell = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    width: 26,
    height: 22,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderWidth: 2.5,
    borderBottomWidth: 0,
    borderColor: COLORS.black,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 6,
  },
  top: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 2.5,
    borderColor: COLORS.black,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 3,
  },
  clapper: {
    width: 8,
    height: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderWidth: 2.5,
    borderTopWidth: 0,
    borderColor: COLORS.black,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 4,
  },
});

// ── Permission Card ───────────────────────────────────────────────────────────
interface PermissionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PermissionCard: React.FC<PermissionCardProps> = ({ icon: IconEl, title, description }) => (
  <View style={card.wrap}>
    <View style={card.iconCol}>{IconEl}</View>
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
    width: 44,
    height: 44,
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
}

const PermissionRequestPage: React.FC<Props> = ({ onContinue }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const [requesting, setRequesting] = useState(false);

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

      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      const notificationsGranted = notificationStatus === 'granted';

      onContinue?.({ location: locationGranted, notifications: notificationsGranted });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {/* ── Heading ── */}
          <View style={styles.headingBlock}>
            <Text style={styles.title}>Permission Request</Text>
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
            icon={<LocationIcon />}
            title="Location- Always On"
            description="Needed to dispatch responders to you instantly"
          />
          <PermissionCard
            icon={<BellIcon />}
            title="Notifications"
            description="Get alerts when help is on the way"
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
