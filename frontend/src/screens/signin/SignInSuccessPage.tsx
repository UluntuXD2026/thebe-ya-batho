import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';

const COLORS = {
  primary: '#E8573A',
  primaryDark: '#C94428',
  black: '#111111',
  darkGray: '#333333',
  mediumGray: '#888888',
  lightGray: '#AAAAAA',
  pageBg: '#FFFFFF',
  cardBg: '#F7F7F7',
};

// ── Session Info Row ──────────────────────────────────────────────────────────
interface InfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isLast = false }) => (
  <View style={[row.wrap, !isLast && row.border]}>
    <Text style={row.label}>{label}</Text>
    <Text style={row.value}>{value}</Text>
  </View>
);

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DEDEDE',
  },
  label: { fontSize: 14, color: COLORS.lightGray },
  value: { fontSize: 14, fontWeight: '600', color: COLORS.black },
});

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  method?: 'OTP Verified' | 'Biometric' | 'Face ID';
  sessionExpiry?: string;
  locationShared?: string;
  onFinish?: () => void;
}

const SignInSuccessPage: React.FC<Props> = ({
  method = 'OTP Verified',
  sessionExpiry = '8 hours',
  locationShared = 'Active',
  onFinish,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 55,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(cardAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(btnAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Auto-redirect after 2.5s
    const timer = setTimeout(() => {
      handleGoToEmergency();
    }, 2500);
    return () => clearTimeout(timer);
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
        <View style={styles.inner}>
          {/* ── Heading ── */}
          <Animated.View
            style={[
              styles.headingBlock,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.title}>Signed In successfully</Text>
            <Text style={styles.subtitle}>
              Redirecting to emergency dashboard
            </Text>
          </Animated.View>

          {/* ── Session info card ── */}
          <Animated.View style={[styles.card, { opacity: cardAnim }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>SESSION INFO</Text>
            </View>
            <InfoRow label="Method Used" value={method} />
            <InfoRow label="Session expires" value={sessionExpiry} />
            <InfoRow label="Location shared" value={locationShared} isLast />
          </Animated.View>

          {/* ── Helper text ── */}
          <Animated.View style={{ opacity: btnAnim }}>
            <Text style={styles.helperText}>
              If not redirected to emergency screen, click the button below
            </Text>

            {/* ── Manual CTA ── */}
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleGoToEmergency}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>GO to Emergency Screen</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignInSuccessPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  scroll: { flexGrow: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },

  headingBlock: { alignItems: 'center', marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 10,
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
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  cardHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.lightGray,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  helperText: {
    fontSize: 13,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },

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
  btnPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
