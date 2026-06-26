import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../../constants/responsive';

const COLORS = {
  primary: '#E8573A',
  primaryDark: '#C94428',
  black: '#111111',
  darkGray: '#333333',
  mediumGray: '#888888',
  pageBg: '#FFFFFF',
  cardBg: '#F7F7F7',
  badgeBorder: '#E8573A',
  badgeText: '#E8573A',
};

// ── Status Row ────────────────────────────────────────────────────────────────
interface StatusRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const StatusRow: React.FC<StatusRowProps> = ({ label, value, isLast = false }) => (
  <View style={[row.wrap, !isLast && row.border]}>
    <Text style={row.label}>{label}</Text>
    <View style={row.badge}>
      <Text style={row.badgeText}>{value}</Text>
    </View>
  </View>
);

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  badge: {
    borderWidth: 1,
    borderColor: COLORS.badgeBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 13,
    color: COLORS.badgeText,
    fontWeight: '500',
  },
});

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  phoneNumber?: string;       // e.g. "+27 82 ••• ••• 14"
  locationEnabled?: boolean;
  notificationsEnabled?: boolean;
  onFinish?: () => void;
}

const AccountCreatedPage: React.FC<Props> = ({
  phoneNumber = '+27 82 ••• ••• 14',
  locationEnabled = true,
  notificationsEnabled = true,
  onFinish,
}) => {
  const { moderateScale, isTablet } = useResponsive();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(cardAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(btnAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGoToEmergency = () => {
    onFinish?.();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, isTablet && styles.innerTablet]}>
          {/* ── Heading ── */}
          <Animated.View
            style={[
              styles.headingBlock,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={[styles.title, { fontSize: moderateScale(28) }]}>Account created!</Text>
            <Text style={styles.subtitle}>You can now use the app in emergencies</Text>
          </Animated.View>

          {/* ── Status card ── */}
          <Animated.View style={[styles.card, { opacity: cardAnim }]}>
            <StatusRow label="Phone verified" value={phoneNumber} />
            <StatusRow
              label="Location access"
              value={locationEnabled ? 'Always on' : 'Disabled'}
            />
            <StatusRow
              label="Notifications"
              value={notificationsEnabled ? 'Enabled' : 'Disabled'}
              isLast
            />
          </Animated.View>

          {/* ── CTA ── */}
          <Animated.View style={{ opacity: btnAnim }}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleGoToEmergency}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>Go to Emergency Screen</Text>
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Add medical info & emergency contacts in Profile
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountCreatedPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  scroll: { flexGrow: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  innerTablet: { paddingHorizontal: 64, alignSelf: 'center', width: '100%', maxWidth: 600 },

  headingBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
  },

  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginBottom: 28,
    overflow: 'hidden',
  },

  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  helperText: {
    fontSize: 13,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});
