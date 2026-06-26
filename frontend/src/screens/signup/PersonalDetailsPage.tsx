import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { completeProfile } from '../../lib/api';
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
  stepActive: '#E8573A',
  stepInactive: '#F2C0B5',
  pinkBack: '#FCE8E4',
};

const TOTAL_STEPS = 5;
const CURRENT_STEP = 3;

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

// ── Personal Details Page ─────────────────────────────────────────────────────
interface Props {
  token?: string;
  onContinue?: (firstName: string) => void;
  onBack?: () => void;
}

const PersonalDetailsPage: React.FC<Props> = ({ token, onContinue, onBack }) => {
  const { moderateScale, isTablet } = useResponsive();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useHardwareBack(() => {
    if (!onBack) return false;
    onBack();
    return true;
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const lastNameRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim() || !token) return;
    setError('');
    setSaving(true);
    try {
      await completeProfile(token, firstName.trim(), lastName.trim());
      onContinue?.(firstName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save details');
    } finally {
      setSaving(false);
    }
  };

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleBack = () => {
    onBack?.();
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
              <Text style={[styles.title, { fontSize: moderateScale(26) }]}>Tell us your name</Text>
            </View>

            {/* ── Step progress ── */}
            <View style={styles.stepsBlock}>
              <StepDots current={CURRENT_STEP} total={TOTAL_STEPS} />
              <Text style={styles.stepLabel}>
                Step {CURRENT_STEP} of {TOTAL_STEPS}:{'  '}Personal details
              </Text>
            </View>

            {/* ── First Name ── */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g Sipho"
                placeholderTextColor={COLORS.lightGray}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            {/* ── Last Name ── */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                ref={lastNameRef}
                style={styles.input}
                placeholder="e.g Dlamini"
                placeholderTextColor={COLORS.lightGray}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            {/* ── Spacer ── */}
            <View style={styles.spacer} />

            {/* ── Continue button ── */}
            <TouchableOpacity
              style={[styles.btnPrimary, (!isValid || saving) && styles.btnDisabled]}
              onPress={handleContinue}
              activeOpacity={isValid ? 0.85 : 0.5}
              disabled={!isValid || saving}
            >
              <Text style={styles.btnPrimaryText}>{saving ? 'Saving...' : 'Continue'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PersonalDetailsPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  flex: { flex: 1 },
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
  title: { fontSize: 26, fontWeight: '700', color: COLORS.black, textAlign: 'center' },

  stepsBlock: { alignItems: 'center', marginBottom: 36 },
  stepLabel: { fontSize: 13, color: COLORS.mediumGray },

  fieldBlock: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.darkGray, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 16,
    color: COLORS.darkGray,
    borderWidth: 0,
  },

  errorText: { fontSize: 13, color: COLORS.primary, textAlign: 'center', marginBottom: 12 },

  spacer: { flex: 1, minHeight: 80 },

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
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
});
