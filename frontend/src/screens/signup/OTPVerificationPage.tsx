import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { registerNumber, verifyCode } from '../../lib/api';
import { useResponsive } from '../../constants/responsive';
import { useHardwareBack } from '../../hooks/useHardwareBack';

const COLORS = {
  primary: '#E8573A',
  primaryDark: '#C94428',
  black: '#111111',
  darkGray: '#333333',
  mediumGray: '#888888',
  lightGray: '#CCCCCC',
  borderGray: '#DDDDDD',
  inputBg: '#F4F4F4',
  inputActiveBg: '#FFFFFF',
  pageBg: '#FFFFFF',
  stepActive: '#E8573A',
  stepInactive: '#F2C0B5',
  infoBorder: '#111111',
};

const TOTAL_STEPS = 5;
const CURRENT_STEP = 2;
const CODE_LENGTH = 6;

// ── Step Dots ─────────────────────────────────────────────────────────────────
const StepDots: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <View style={dots.row}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          dots.dot,
          i === current - 1 ? dots.dotActive : i < current - 1 ? dots.dotDone : dots.dotInactive,
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

// ── OTP Verification Page ─────────────────────────────────────────────────────
interface Props {
  phoneNumber?: string; // e.g. "+27821234585"
  onVerified?: (token: string) => void;
  onBack?: () => void;
  onResend?: (phoneNumber: string) => Promise<unknown>;
}

const OTPVerificationPage: React.FC<Props> = ({
  phoneNumber = '+27 82 ••• ••• 85',
  onVerified,
  onBack,
  onResend = registerNumber,
}) => {
  const { moderateScale, isTablet } = useResponsive();

  useHardwareBack(
    useCallback(() => {
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    }, [onBack]),
  );

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(107); // 1:47
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  // Fade in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...code];
    updated[idx] = digit;
    setCode(updated);
    if (digit && idx < CODE_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < CODE_LENGTH) {
      setError('Enter the full 6-digit code');
      return;
    }
    setError('');
    setVerifying(true);
    try {
      const result = await verifyCode(phoneNumber, fullCode);
      onVerified?.(result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleChangeNumber = () => {
    onBack?.();
  };

  const handleResend = async () => {
    setSeconds(107);
    setCode(Array(CODE_LENGTH).fill(''));
    setError('');
    inputRefs.current[0]?.focus();
    try {
      await onResend(phoneNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    }
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
              isTablet && styles.innerTablet,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* ── Heading ── */}
            <View style={styles.headingBlock}>
              <Text style={[styles.title, { fontSize: moderateScale(26) }]}>Enter code</Text>
              <Text style={styles.subtitle}>Sent to {phoneNumber}</Text>
            </View>

            {/* ── Step progress ── */}
            <View style={styles.stepsBlock}>
              <StepDots current={CURRENT_STEP} total={TOTAL_STEPS} />
              <Text style={styles.stepLabel}>
                Step {CURRENT_STEP} of {TOTAL_STEPS}: Code number
              </Text>
            </View>

            {/* ── Timer ── */}
            <View style={styles.timerBlock}>
              <Text style={styles.timerLabel}>6-digit code expires in</Text>
              <Text
                style={[
                  styles.timerValue,
                  { fontSize: moderateScale(36) },
                  seconds < 30 && styles.timerWarning,
                ]}
              >
                {formatTime(seconds)}
              </Text>
            </View>

            {/* ── OTP boxes ── */}
            <View style={[styles.otpRow, isTablet && styles.otpRowTablet]}>
              {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                <TextInput
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  style={[
                    styles.otpBox,
                    { fontSize: moderateScale(22) },
                    isTablet && styles.otpBoxTablet,
                    code[i] ? styles.otpBoxFilled : styles.otpBoxEmpty,
                  ]}
                  value={code[i]}
                  onChangeText={val => handleChange(val, i)}
                  onKeyPress={e => handleKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  caretHidden
                />
              ))}
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            {/* ── Auto-fill note ── */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>OTP auto-fills from SMS on Android & iOS</Text>
            </View>

            {/* ── Verify button ── */}
            <TouchableOpacity
              style={[styles.btnPrimary, verifying && styles.btnDisabled]}
              onPress={handleVerify}
              activeOpacity={0.85}
              disabled={verifying}
            >
              <Text style={styles.btnPrimaryText}>
                {verifying ? 'Verifying...' : 'Verify & Sign Up'}
              </Text>
            </TouchableOpacity>

            {/* ── Change / Resend row ── */}
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handleChangeNumber} activeOpacity={0.7}>
                <Text style={styles.actionLink}>← Change number</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleResend}
                activeOpacity={seconds > 0 ? 0.4 : 0.7}
                disabled={seconds > 0}
              >
                <Text style={[styles.actionLink, seconds > 0 && styles.actionLinkDisabled]}>
                  Resend code
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.helpText}>Didn't get it? Check SMS or call me instead</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OTPVerificationPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 48 },
  innerTablet: { paddingHorizontal: 64, alignSelf: 'center', width: '100%', maxWidth: 600 },

  headingBlock: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.black, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.mediumGray, textAlign: 'center' },

  stepsBlock: { alignItems: 'center', marginBottom: 24 },
  stepLabel: { fontSize: 13, color: COLORS.mediumGray },

  timerBlock: { alignItems: 'center', marginBottom: 24 },
  timerLabel: { fontSize: 13, color: COLORS.mediumGray, marginBottom: 4 },
  timerValue: { fontSize: 36, fontWeight: '700', color: COLORS.black, letterSpacing: 2 },
  timerWarning: { color: COLORS.primary },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  otpRowTablet: {
    justifyContent: 'center',
    gap: 16,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    fontWeight: '700',
    color: COLORS.black,
  },
  otpBoxTablet: {
    flex: 0,
    width: 56,
    height: 56,
  },
  otpBoxEmpty: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 0,
  },
  otpBoxFilled: {
    backgroundColor: COLORS.inputActiveBg,
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
  },

  infoBox: {
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoText: { fontSize: 13, color: COLORS.black, textAlign: 'center' },

  errorText: { fontSize: 13, color: COLORS.primary, textAlign: 'center', marginBottom: 12 },

  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
  btnDisabled: { opacity: 0.6 },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionLink: { fontSize: 14, color: COLORS.darkGray, fontWeight: '500' },
  actionLinkDisabled: { opacity: 0.35 },

  helpText: { fontSize: 13, color: COLORS.mediumGray, textAlign: 'center' },
});
