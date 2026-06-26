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

import { verifyCode } from '../../lib/api';
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
  pageBg: '#FFFFFF',
  pinkBack: '#FCE8E4',
};

const CODE_LENGTH = 6;

interface Props {
  phoneNumber?: string; // e.g. "+27_ _ _ _ _85"
  onVerified?: (token: string, firstName?: string) => void;
  onBack?: () => void;
  onResend?: (phoneNumber: string) => Promise<unknown>;
}

const SignInOTPPage: React.FC<Props> = ({
  phoneNumber = '+27_ _ _ _ _85',
  onVerified,
  onBack,
  onResend,
}) => {
  const { moderateScale } = useResponsive();

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
  const [seconds, setSeconds] = useState(107);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
    ]).start();
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
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
    if (digit && idx < CODE_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
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
      onVerified?.(result.token, result.firstName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setSeconds(107);
    setCode(Array(CODE_LENGTH).fill(''));
    setError('');
    inputRefs.current[0]?.focus();
    try {
      await onResend?.(phoneNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    }
  };

  const handleBack = () => {
    onBack?.();
  };

  const handleCallInstead = () => {
    // Trigger a voice call OTP
    console.log('Call me instead');
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
            style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
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
              <View style={styles.headerCenter}>
                <Text style={[styles.title, { fontSize: moderateScale(22) }]}>Enter Code</Text>
                <Text style={styles.subtitle}>Code sent to {phoneNumber}</Text>
              </View>
              <View style={[styles.backBtnSpacer, { width: moderateScale(40) }]} />
            </View>

            {/* ── Timer ── */}
            <View style={styles.timerBlock}>
              <Text style={styles.timerLabel}>6 Digit code expires in</Text>
              <Text
                style={[
                  styles.timerValue,
                  { fontSize: moderateScale(40) },
                  seconds < 30 && styles.timerWarning,
                ]}
              >
                {formatTime(seconds)}
              </Text>
            </View>

            {/* ── OTP boxes ── */}
            <View style={styles.otpRow}>
              {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                <TextInput
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  style={[
                    styles.otpBox,
                    { fontSize: moderateScale(22) },
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

            {/* ── Resend row ── */}
            <View style={styles.resendRow}>
              <Text style={styles.resendBase}>Didn't get code ? </Text>
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            </View>

            {/* ── Verify button ── */}
            <TouchableOpacity
              style={[styles.btnPrimary, verifying && styles.btnDisabled]}
              onPress={handleVerify}
              activeOpacity={0.85}
              disabled={verifying}
            >
              <Text style={[styles.btnPrimaryText, { fontSize: moderateScale(16) }]}>
                {verifying ? 'Verifying...' : 'Verify & Sign In'}
              </Text>
            </TouchableOpacity>

            {/* ── Call me instead ── */}
            <TouchableOpacity
              style={styles.callRow}
              onPress={handleCallInstead}
              activeOpacity={0.7}
            >
              <Text style={styles.callIcon}>📞 </Text>
              <Text style={styles.callText}>Call me instead</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInOTPPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.pinkBack,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  backArrow: { fontSize: 26, color: COLORS.primary, lineHeight: 30, marginTop: -2 },
  headerCenter: { flex: 1, alignItems: 'center' },
  backBtnSpacer: { width: 40 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.black, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.mediumGray, textAlign: 'center' },

  // Timer
  timerBlock: { alignItems: 'center', marginBottom: 24 },
  timerLabel: { fontSize: 14, color: COLORS.mediumGray, marginBottom: 4 },
  timerValue: { fontSize: 40, fontWeight: '700', color: COLORS.black, letterSpacing: 3 },
  timerWarning: { color: COLORS.primary },

  // OTP boxes
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
  },
  otpBoxEmpty: { backgroundColor: COLORS.pageBg },
  otpBoxFilled: { backgroundColor: COLORS.pageBg, borderColor: COLORS.darkGray },

  errorText: { fontSize: 13, color: COLORS.primary, textAlign: 'center', marginBottom: 12 },

  // Resend
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendBase: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  resendLink: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  // Button
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

  // Call instead
  callRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  callIcon: { fontSize: 14 },
  callText: { fontSize: 14, color: COLORS.darkGray },
});
