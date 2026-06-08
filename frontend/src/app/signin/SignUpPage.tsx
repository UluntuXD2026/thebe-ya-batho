import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

const COLORS = {
  primary: '#E8573A',
  primaryDark: '#C94428',
  black: '#111111',
  darkGray: '#333333',
  mediumGray: '#888888',
  lightGray: '#CCCCCC',
  borderGray: '#DDDDDD',
  pageBg: '#FFFFFF',
  stepActive: '#E8573A',
  stepInactive: '#F2C0B5',
};

const TOTAL_STEPS = 5;
const CURRENT_STEP = 1;

// ── Step Progress Dots ────────────────────────────────────────────────────────
const StepDots: React.FC<{ current: number; total: number }> = ({
  current,
  total,
}) => (
  <View style={dots.row}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          dots.dot,
          i === 0
            ? dots.dotFirst
            : i < current
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
  dot: {
    height: 10,
    borderRadius: 5,
  },
  // First (active) dot is a pill/elongated
  dotFirst: {
    width: 28,
    backgroundColor: COLORS.stepActive,
  },
  // Completed dots
  dotDone: {
    width: 10,
    backgroundColor: COLORS.stepActive,
    opacity: 0.6,
  },
  // Remaining dots
  dotInactive: {
    width: 10,
    backgroundColor: COLORS.stepInactive,
  },
});

// ── Main Component ────────────────────────────────────────────────────────────
type SignUpPageProps = {
  onSignIn?: () => void;
};

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignIn }) => {
  const [phone, setPhone] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSendCode = () => {
    // navigation.navigate('OTPVerification', { phone, flow: 'signup' });
    console.log('Send verification code to:', `+27${phone}`);
  };

  const handleSignIn = () => {
    onSignIn?.();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.inner,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* ── Heading ── */}
            <View style={styles.headingBlock}>
              <Text style={styles.title}>Get started</Text>
              <Text style={styles.subtitle}>
                Enter your mobile number to begin
              </Text>
            </View>

            {/* ── Step progress ── */}
            <View style={styles.stepsBlock}>
              <StepDots current={CURRENT_STEP} total={TOTAL_STEPS} />
              <Text style={styles.stepLabel}>
                Step {CURRENT_STEP} of {TOTAL_STEPS}: Phone number
              </Text>
            </View>

            {/* ── Phone input ── */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.dialCode}>+27</Text>
                <TextInput
                  style={styles.input}
                  placeholder="__ __ __ __ __"
                  placeholderTextColor={COLORS.lightGray}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={9}
                  returnKeyType="done"
                  autoFocus={false}
                />
              </View>
            </View>

            {/* ── Send Verification Code ── */}
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleSendCode}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>Send Verification Code</Text>
            </TouchableOpacity>

            {/* ── Helper text ── */}
            <Text style={styles.helperText}>
              We'll send a one-time code to this number
            </Text>

            {/* ── Sign in link ── */}
            <View style={styles.signInBlock}>
              <Text style={styles.signInQuestion}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
                <Text style={styles.signInLink}>Sign in instead →</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpPage;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },

  // ── Heading ───────────────────────────────────────────
  headingBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
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

  // ── Step dots + label ─────────────────────────────────
  stepsBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepLabel: {
    fontSize: 13,
    color: COLORS.mediumGray,
    textAlign: 'center',
  },

  // ── Phone field ───────────────────────────────────────
  fieldBlock: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: COLORS.pageBg,
  },
  dialCode: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkGray,
    padding: 0,
    letterSpacing: 2,
  },

  // ── Primary button ────────────────────────────────────
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // ── Helper text ───────────────────────────────────────
  helperText: {
    fontSize: 13,
    color: COLORS.mediumGray,
    textAlign: 'center',
    marginBottom: 28,
  },

  // ── Sign in block ─────────────────────────────────────
  signInBlock: {
    alignItems: 'center',
    gap: 6,
  },
  signInQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  signInLink: {
    fontSize: 14,
    color: COLORS.mediumGray,
  },
});
