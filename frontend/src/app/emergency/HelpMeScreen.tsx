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
} from 'react-native';

import SOSScreen from './SOSScreen';

const COLORS = {
  primary: '#E8573A',
  primaryDark: '#C94428',
  black: '#111111',
  darkGray: '#333333',
  borderGray: '#CCCCCC',
  pageBg: '#FFFFFF',
};

interface EmergencyOption {
  id: string;
  label: string;
  number: string; // SA emergency numbers
}

const EMERGENCY_OPTIONS: EmergencyOption[] = [
  { id: 'ambulance', label: 'Call an ambulance', number: '10177' },
  { id: 'police',    label: 'Call the Police',   number: '10111' },
  { id: 'fire',      label: 'Call Fire Fighter',  number: '10111' },
];

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  onCancel?: () => void;
}

const HelpMeScreen: React.FC<Props> = ({ onCancel }) => {
  const [showSOS, setShowSOS] = useState(false);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSelect = (option: EmergencyOption) => {
    setShowSOS(true);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  if (showSOS) {
    return <SOSScreen onCancel={() => setShowSOS(false)} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />

      <Animated.View
        style={[
          styles.inner,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* ── Title ── */}
        <Text style={styles.title}>Select your emergency</Text>

        {/* ── Options ── */}
        <View style={styles.optionsBlock}>
          {EMERGENCY_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionBtn}
              onPress={() => handleSelect(option)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Spacer ── */}
        <View style={styles.spacer} />

        {/* ── Cancel ── */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleCancel}
          activeOpacity={0.85}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default HelpMeScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: Platform.OS === 'ios' ? 24 : 32,
  },

  // Title
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 32,
  },

  // Options
  optionsBlock: {
    gap: 16,
  },
  optionBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: COLORS.pageBg,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '400',
  },

  spacer: { flex: 1 },

  // Cancel
  cancelBtn: {
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
  cancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
