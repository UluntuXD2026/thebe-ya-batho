import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResponsive } from '@/constants/responsive';
import { useHardwareBack } from '@/hooks/useHardwareBack';

const COLORS = {
  pageBg: '#1E2347',
  cardBg: '#FFFFFF',
  cancelBg: '#2A3060',
  primary: '#E8573A',
  primaryDark: '#C94428',
  titleText: '#111111',
  subtitleText: '#555555',
  metaLabel: '#888888',
  metaValue: '#222222',
  mapBg: '#D6E4F0',
  mapGrid: '#B8CFDF',
  mapRoad: '#FFFFFF',
  mapPin: '#E8573A',
  divider: '#EEEEEE',
  cancelText: '#FFFFFF',
  white: '#FFFFFF',
  infoBg: '#F7F7F7',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = (date: Date): string =>
  date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

// ── Map placeholder ───────────────────────────────────────────────────────────
// Swap this with <MapView> from react-native-maps when ready
const MapPlaceholder: React.FC<{ latitude: string; longitude: string; height: number }> = ({
  latitude,
  longitude,
  height,
}) => (
  <View style={[map.wrap, { height }]}>
    {/* Grid lines to simulate a map — positioned in % of the map container, not the screen */}
    {[0, 1, 2, 3, 4].map(i => (
      <View key={`h${i}`} style={[map.gridLine, map.horizontal, { top: `${i * 25}%` }]} />
    ))}
    {[0, 1, 2, 3, 4].map(i => (
      <View key={`v${i}`} style={[map.gridLine, map.vertical, { left: `${i * 25}%` }]} />
    ))}
    {/* Simulated roads */}
    <View style={[map.road, map.roadH, { top: '40%' }]} />
    <View style={[map.road, map.roadV, { left: '55%' }]} />

    {/* Pin */}
    <View style={map.pinWrap}>
      <View style={map.pinCircle}>
        <Text style={map.pinIcon}>📍</Text>
      </View>
      <View style={map.pinShadow} />
    </View>

    {/* Coords label */}
    <View style={map.coordsBox}>
      <Text style={map.coordsText}>
        {latitude}, {longitude}
      </Text>
    </View>

    {/* Replace hint */}
    <View style={map.hintBox}>
      <Text style={map.hintText}>Replace with {'<MapView>'} from react-native-maps</Text>
    </View>
  </View>
);

const map = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: COLORS.mapBg,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: COLORS.mapGrid,
  },
  horizontal: { width: '100%', height: 1 },
  vertical:   { height: '100%', width: 1 },
  road: {
    position: 'absolute',
    backgroundColor: COLORS.mapRoad,
    opacity: 0.8,
  },
  roadH: { width: '100%', height: 6 },
  roadV: { height: '100%', width: 6 },
  pinWrap: {
    alignItems: 'center',
    zIndex: 10,
  },
  pinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pinIcon: { fontSize: 22 },
  pinShadow: {
    width: 12,
    height: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 2,
  },
  coordsBox: {
    position: 'absolute',
    bottom: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  coordsText: { fontSize: 11, color: COLORS.white, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  hintBox: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  hintText: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' },
});

// ── Meta info row ─────────────────────────────────────────────────────────────
const MetaRow: React.FC<{ icon: string; label: string; value: string }> = ({
  icon, label, value,
}) => (
  <View style={meta.row}>
    <Text style={meta.icon}>{icon}</Text>
    <View style={meta.textCol}>
      <Text style={meta.label}>{label}</Text>
      <Text style={meta.value}>{value}</Text>
    </View>
  </View>
);
const meta = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  icon: { fontSize: 18, width: 26, textAlign: 'center' },
  textCol: { flex: 1 },
  label: { fontSize: 11, color: COLORS.metaLabel, marginBottom: 1 },
  value: { fontSize: 14, fontWeight: '600', color: COLORS.metaValue },
});

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  requesterName?: string;
  latitude?: string;
  longitude?: string;
  address?: string;
  onAttend?: () => void;
  onCancel?: () => void;
}

// ── Main Component ────────────────────────────────────────────────────────────
const EmergencyRequestScreen: React.FC<Props> = ({
  requesterName = 'Nyakallo',
  latitude      = '-26.2041',
  longitude     = '28.0473',
  address       = 'Sebokeng, Emfuleni, Gauteng',
  onAttend,
  onCancel,
}) => {
  const { width, verticalScale, isTablet } = useResponsive();
  const mapHeight = Math.min(verticalScale(160), width * 0.45);

  const [requestTime]  = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Live clock
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    // Log to console when screen mounts
    console.log('🚨 Emergency request received');
    console.log('   Requester :', requesterName);
    console.log('   Time sent :', formatTime(requestTime), '—', formatDate(requestTime));
    console.log('   Location  :', address);
    console.log('   Coords    :', `${latitude}, ${longitude}`);

    // Card pop-in
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
    ]).start();

    // Attention shake — runs 4 times
    Animated.sequence([
      Animated.delay(450),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 7,  duration: 55, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 5,  duration: 55, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -5, duration: 55, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0,  duration: 55, useNativeDriver: true }),
          Animated.delay(2500),
        ]),
        { iterations: 4 }
      ),
    ]).start();
  }, []);

  const handleAttend = () => {
    console.log('✅ Attending emergency for:', requesterName, 'at', formatTime(new Date()));
    onAttend?.();
    // navigation.navigate('ActiveEmergency', { requesterName, latitude, longitude });
  };

  useHardwareBack(
    useCallback(() => {
      if (onCancel) {
        onCancel();
        return true;
      }
      return false;
    }, [onCancel]),
  );

  const handleCancel = () => {
    console.log('❌ Emergency request dismissed at:', formatTime(new Date()));
    onCancel?.();
    // navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.pageBg} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Emergency card ── */}
        <Animated.View
          style={[
            styles.card,
            isTablet && styles.cardTablet,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
            },
          ]}
        >
          {/* Header */}
          <Text style={styles.emergencyTitle}>EMERGENCY!</Text>
          <Text style={styles.requesterText}>{requesterName} requesting help</Text>

          <View style={styles.divider} />

          {/* ── Map ── */}
          <MapPlaceholder latitude={latitude} longitude={longitude} height={mapHeight} />

          {/* ── Meta info ── */}
          <View style={styles.metaBlock}>
            <MetaRow
              icon="🕐"
              label="Request sent"
              value={`${formatTime(requestTime)}  ·  ${formatDate(requestTime)}`}
            />
            <MetaRow
              icon="📍"
              label="Location"
              value={address}
            />
            <MetaRow
              icon="🌐"
              label="Coordinates"
              value={`${latitude}, ${longitude}`}
            />
            <View style={[meta.row, { borderBottomWidth: 0 }]}>
              <Text style={[meta.icon]}>⏱️</Text>
              <View style={meta.textCol}>
                <Text style={meta.label}>Current time</Text>
                <Text style={meta.value}>{formatTime(currentTime)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ── Attend button ── */}
          <TouchableOpacity
            style={styles.attendBtn}
            onPress={handleAttend}
            activeOpacity={0.85}
          >
            <Text style={styles.attendText}>Attend Emergency</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Cancel button ── */}
        <Animated.View
          style={[
            styles.cancelWrap,
            isTablet && styles.cancelWrapTablet,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            activeOpacity={0.75}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmergencyRequestScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 14,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    alignSelf: 'center',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  // On tablets/web, cap card width and center it instead of stretching edge-to-edge.
  cardTablet: {
    maxWidth: 480,
  },
  emergencyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.titleText,
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  requesterText: {
    fontSize: 15,
    color: COLORS.subtitleText,
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.divider,
    marginVertical: 16,
  },
  metaBlock: {
    gap: 0,
    marginBottom: 4,
  },
  attendBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  attendText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Cancel
  cancelWrap: { width: '100%' },
  cancelWrapTablet: { maxWidth: 480, alignSelf: 'center' },
  cancelBtn: {
    width: '100%',
    backgroundColor: COLORS.cancelBg,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.cancelText,
    fontSize: 16,
    fontWeight: '600',
  },
});
