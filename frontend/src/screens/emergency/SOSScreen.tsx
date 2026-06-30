import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  pageBg: '#1E2347',
  titleText: '#FFFFFF',
  bodyText: '#C8CCE8',
  sosRed: '#D72B2B',
  sosRedDark: '#A01F1F',
  sosGlow: 'rgba(215, 43, 43, 0.25)',
  ringColor: 'rgba(215, 43, 43, 0.35)',
  cancelBtn: '#E8573A',
  callBtn: '#34C759',
  white: '#FFFFFF',
};

const SOS_SIZE = 120;
const RING_COUNT = 5;

// ── SOS icon ──────────────────────────────────────────────────────────────────
const sosXml = `<svg width="70" height="32" viewBox="0 0 70 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M30.2273 32C28.4773 32 26.9792 31.3733 25.733 30.12C24.4867 28.8667 23.8636 27.36 23.8636 25.6V6.4C23.8636 4.64 24.4867 3.13333 25.733 1.88C26.9792 0.626667 28.4773 0 30.2273 0H39.7727C41.5227 0 43.0208 0.626667 44.267 1.88C45.5133 3.13333 46.1364 4.64 46.1364 6.4V25.6C46.1364 27.36 45.5133 28.8667 44.267 30.12C43.0208 31.3733 41.5227 32 39.7727 32H30.2273ZM0 32V25.6H12.7273V19.2H6.36364C4.61364 19.2 3.11553 18.5733 1.86932 17.32C0.623106 16.0667 0 14.56 0 12.8V6.4C0 4.64 0.623106 3.13333 1.86932 1.88C3.11553 0.626667 4.61364 0 6.36364 0H19.0909V6.4H6.36364V12.8H12.7273C14.4773 12.8 15.9754 13.4267 17.2216 14.68C18.4678 15.9333 19.0909 17.44 19.0909 19.2V25.6C19.0909 27.36 18.4678 28.8667 17.2216 30.12C15.9754 31.3733 14.4773 32 12.7273 32H0ZM50.9091 32V25.6H63.6364V19.2H57.2727C55.5227 19.2 54.0246 18.5733 52.7784 17.32C51.5322 16.0667 50.9091 14.56 50.9091 12.8V6.4C50.9091 4.64 51.5322 3.13333 52.7784 1.88C54.0246 0.626667 55.5227 0 57.2727 0H70V6.4H57.2727V12.8H63.6364C65.3864 12.8 66.8845 13.4267 68.1307 14.68C69.3769 15.9333 70 17.44 70 19.2V25.6C70 27.36 69.3769 28.8667 68.1307 30.12C66.8845 31.3733 65.3864 32 63.6364 32H50.9091ZM30.2273 25.6H39.7727V6.4H30.2273V25.6Z" fill="white"/>
</svg>`;

const SOSIcon: React.FC = () => <SvgXml xml={sosXml} width={70} height={32} />;

// ── Cancel icon ───────────────────────────────────────────────────────────────
const cancelXml = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.395508 17.4756C0.0146484 17.8564 0 18.501 0.395508 18.8818C0.776367 19.2773 1.4209 19.2627 1.80176 18.8818L9.63867 11.0449L17.4756 18.8818C17.8564 19.2627 18.501 19.2773 18.8818 18.8818C19.2773 18.501 19.2627 17.8564 18.8818 17.4756L11.0449 9.63867L18.8818 1.78711C19.2627 1.40625 19.2773 0.776367 18.8818 0.395508C18.501 0 17.8564 0.0146484 17.4756 0.395508L9.63867 8.23242L1.80176 0.395508C1.4209 0.0146484 0.776367 0 0.395508 0.395508C0 0.776367 0.0146484 1.40625 0.395508 1.78711L8.23242 9.63867L0.395508 17.4756Z" fill="white"/>
</svg>`;

const CancelIcon: React.FC = () => <SvgXml xml={cancelXml} width={20} height={20} />;

// ── Call icon ─────────────────────────────────────────────────────────────────
const callXml = `<svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M24.7188 26.25C21.6806 26.25 18.6788 25.5877 15.7135 24.263C12.7483 22.9384 10.0503 21.0608 7.61979 18.6302C5.18924 16.1997 3.31163 13.5017 1.98698 10.5365C0.662327 7.57118 0 4.56945 0 1.53125C0 1.09375 0.145833 0.729167 0.4375 0.4375C0.729167 0.145833 1.09375 0 1.53125 0H7.4375C7.77778 0 8.0816 0.115451 8.34896 0.346354C8.61632 0.577257 8.77431 0.850694 8.82292 1.16667L9.77083 6.27083C9.81944 6.65972 9.80729 6.98785 9.73438 7.25521C9.66146 7.52257 9.52778 7.75347 9.33333 7.94792L5.79688 11.5208C6.28299 12.4201 6.86024 13.2891 7.52865 14.1276C8.19705 14.9661 8.93229 15.7743 9.73438 16.5521C10.4878 17.3056 11.2778 18.0043 12.1042 18.6484C12.9306 19.2925 13.8056 19.8819 14.7292 20.4167L18.1562 16.9896C18.375 16.7708 18.6606 16.6068 19.013 16.4974C19.3655 16.388 19.7118 16.3576 20.0521 16.4062L25.0833 17.4271C25.4236 17.5243 25.7031 17.7005 25.9219 17.9557C26.1406 18.2109 26.25 18.4965 26.25 18.8125V24.7188C26.25 25.1563 26.1042 25.5208 25.8125 25.8125C25.5208 26.1042 25.1563 26.25 24.7188 26.25Z" fill="white"/>
</svg>`;

const CallIcon: React.FC = () => <SvgXml xml={callXml} width={27} height={27} />;

// ── Pulsing ring ──────────────────────────────────────────────────────────────
const PulseRing: React.FC<{ delay: number; maxScale: number }> = ({ delay, maxScale }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const pulse = () =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: maxScale,
              duration: 2200,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 2200,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0.7, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();

    pulse();
  }, []);

  const ringSize = SOS_SIZE + 20;

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  onCancel?: () => void;
}

const SOSScreen: React.FC<Props> = ({ onCancel }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Subtle SOS button breathe
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Page fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // SOS button slow breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleCancel = () => {
    onCancel?.();
  };

  const handleCall = () => {
    // Linking.openURL('tel:10111') or connect to dispatcher
    console.log('Call emergency services');
  };

  // Equal delay steps & matching max scale so rings stay evenly spaced as they expand
  const RING_DURATION = 2200;
  const RING_MAX_SCALE = 3.0;
  const rings = Array.from({ length: RING_COUNT }, (_, i) => ({
    delay: (i * RING_DURATION) / RING_COUNT,
    maxScale: RING_MAX_SCALE,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.pageBg} />

      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        {/* ── Heading ── */}
        <View style={styles.headingBlock}>
          <Text style={styles.title}>Requesting help</Text>
          <Text style={styles.body}>
            Please hold on, we are reaching out for assistance. Your emergency
            contacts and nearby rescue services will be alerted to your request
            for help.
          </Text>
        </View>

        {/* ── SOS button + rings ── */}
        <View style={styles.sosContainer}>
          {/* Dashed rings rendered behind the button */}
          {rings.map((r, i) => (
            <PulseRing key={i} delay={r.delay} maxScale={r.maxScale} />
          ))}

          {/* SOS button */}
          <Animated.View
            style={[styles.sosBtn, { transform: [{ scale: breatheAnim }] }]}
          >
            <SOSIcon />
          </Animated.View>
        </View>

        <View style={styles.spacer} />

        {/* ── Action buttons ── */}
        <View style={styles.actionRow}>
          {/* Cancel */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <CancelIcon />
          </TouchableOpacity>

          {/* Call */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.callBtn]}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <CallIcon />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default SOSScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 24 : 32,
  },

  // Heading
  headingBlock: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.titleText,
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: COLORS.bodyText,
    textAlign: 'center',
    lineHeight: 24,
  },

  // SOS area
  sosContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Pulse ring
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: COLORS.ringColor,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },

  // SOS button
  sosBtn: {
    width: SOS_SIZE,
    height: SOS_SIZE,
    borderRadius: SOS_SIZE / 2,
    backgroundColor: COLORS.sosRed,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.sosRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 20,
    zIndex: 10,
  },

  spacer: { flex: 1 },

  // Bottom action row
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 8,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelBtn: {
    backgroundColor: COLORS.cancelBtn,
    shadowColor: COLORS.cancelBtn,
  },
  callBtn: {
    backgroundColor: COLORS.callBtn,
    shadowColor: COLORS.callBtn,
  },
});
