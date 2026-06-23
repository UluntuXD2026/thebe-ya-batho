import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import { EmergencyContact, getEmergencyContacts } from '../../lib/api';
import CommunityPage from '../community/CommunityPage';
import ManageContactsPage from '../community/ManageContactsPage';
import HelpMeScreen from '../emergency/HelpMeScreen';

const contactName = (contact: EmergencyContact) =>
  [contact.to.firstName, contact.to.lastName].filter(Boolean).join(' ') || contact.to.number;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#E8573A',
  primaryDark: '#C94428',
  navyDark: '#1E2D4E',
  black: '#111111',
  darkGray: '#333333',
  mediumGray: '#777777',
  lightGray: '#AAAAAA',
  borderGray: '#E8E8E8',
  pageBg: '#F5F5F5',
  cardBg: '#FFFFFF',
  trackingBg: '#EEEEEE',
  trackingBar: '#E8573A',
  trackingBarInactive: '#F2C0B5',
  onlineGreen: '#34C759',
  badgeBg: '#E8573A',
  tabActivePill: '#E8573A',
  tabInactive: '#EEEEEE',
  helpMeBtn: '#E8573A',
  helpMeBtnShadow: '#C94428',
  navBg: '#FFFFFF',
  unreadBadge: '#E8573A',
  activeBlue: '#3B5BDB',
};

// ── Tracking progress bars ────────────────────────────────────────────────────
const TrackingBars: React.FC = () => (
  <View style={tb.row}>
    {[1, 2, 3, 4].map(i => (
      <View key={i} style={[tb.bar, i <= 2 ? tb.barActive : tb.barInactive]} />
    ))}
  </View>
);
const tb = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, marginTop: 8, alignSelf: 'flex-start' },
  bar: { width: 18, height: 4, borderRadius: 2 },
  barActive: { backgroundColor: COLORS.trackingBar },
  barInactive: { backgroundColor: COLORS.trackingBarInactive },
});

// ── Emergency pill button ─────────────────────────────────────────────────────
interface EmergencyBtnProps {
  label: string;
  onPress: () => void;
}
const EmergencyBtn: React.FC<EmergencyBtnProps> = ({ label, onPress }) => (
  <TouchableOpacity style={em.pill} onPress={onPress} activeOpacity={0.75}>
    <Text style={em.label}>{label}</Text>
  </TouchableOpacity>
);
const em = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: COLORS.cardBg,
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.black },
});

// ── Community message row ─────────────────────────────────────────────────────
interface MessageRowProps {
  name: string;
  preview: string;
  time: string;
  unread?: number;
}
const MessageRow: React.FC<MessageRowProps> = ({
  name, preview, time, unread,
}) => (
  <TouchableOpacity style={msg.row} activeOpacity={0.75}>
    <View style={msg.avatar} />
    <View style={msg.body}>
      <View style={msg.topRow}>
        <Text style={msg.name}>{name}</Text>
        <Text style={msg.time}>{time}</Text>
      </View>
      <View style={msg.bottomRow}>
        <Text style={msg.preview} numberOfLines={1}>{preview}</Text>
        {!!unread && (
          <View style={msg.badge}>
            <Text style={msg.badgeText}>{unread}</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);
const msg = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderGray,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.trackingBg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  body: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.black },
  time: { fontSize: 12, color: COLORS.lightGray },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: { fontSize: 13, color: COLORS.mediumGray, flex: 1, marginRight: 8 },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.unreadBadge,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontSize: 11, color: '#FFF', fontWeight: '700' },
});

// ── Home icon ─────────────────────────────────────────────────────────────────
const homeXml = (color: string) => `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 29.3333V16H20V29.3333M4 12L16 2.66666L28 12V26.6667C28 27.3739 27.719 28.0522 27.219 28.5523C26.7189 29.0524 26.0406 29.3333 25.3333 29.3333H6.66667C5.95942 29.3333 5.28115 29.0524 4.78105 28.5523C4.28095 28.0522 4 27.3739 4 26.6667V12Z" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const HomeIcon: React.FC<{ color?: string }> = ({ color = 'white' }) => (
  <SvgXml xml={homeXml(color)} width={22} height={22} />
);

// ── Message circle icon ───────────────────────────────────────────────────────
const messageCircleXml = (color: string) => `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28 15.3333C28.0046 17.0932 27.5934 18.8292 26.8 20.4C25.8592 22.2823 24.413 23.8656 22.6233 24.9724C20.8335 26.0792 18.771 26.6659 16.6667 26.6667C14.9068 26.6713 13.1708 26.2601 11.6 25.4667L4 28L6.53333 20.4C5.73991 18.8292 5.32875 17.0932 5.33333 15.3333C5.33415 13.229 5.92082 11.1665 7.02763 9.37674C8.13444 7.58701 9.71767 6.14076 11.6 5.20001C13.1708 4.40658 14.9068 3.99542 16.6667 4.00001H17.3333C20.1125 4.15333 22.7374 5.32636 24.7055 7.29449C26.6737 9.26262 27.8467 11.8875 28 14.6667V15.3333Z" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const MessageCircleIcon: React.FC<{ color?: string }> = ({ color = '#29274D' }) => (
  <SvgXml xml={messageCircleXml(color)} width={22} height={22} />
);

// ── Bottom Nav ────────────────────────────────────────────────────────────────
const BottomNav: React.FC<{ onHelpMe: () => void; onChat: () => void }> = ({ onHelpMe, onChat }) => (
  <View style={nav.wrap}>
    {/* Home */}
    <TouchableOpacity style={nav.tab} activeOpacity={0.7}>
      <View style={nav.iconCircleActive}>
        <HomeIcon color="white" />
      </View>
    </TouchableOpacity>

    {/* Chat */}
    <TouchableOpacity style={nav.tab} activeOpacity={0.7} onPress={onChat}>
      <View style={nav.iconCircleOutline}>
        <MessageCircleIcon color={COLORS.navyDark} />
      </View>
    </TouchableOpacity>

    {/* Help Me FAB */}
    <View style={nav.helpBtnHalo} pointerEvents="box-none">
      <TouchableOpacity style={nav.helpBtn} onPress={onHelpMe} activeOpacity={0.85}>
        <Text style={nav.helpText}>Help Me</Text>
      </TouchableOpacity>
    </View>
  </View>
);
const nav = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 5,
    marginHorizontal: 32,
    marginBottom: 16,
    borderRadius: 37,
    backgroundColor: COLORS.navBg,
    position: 'relative',
    outlineWidth: StyleSheet.hairlineWidth,
    outlineColor: COLORS.borderGray,
    outlineStyle: 'solid',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  tab: { alignItems: 'center' },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navyDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleActive: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navyDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleOutline: {
    width: 48,
    height: 48,
    borderRadius: 24,
    outlineWidth: StyleSheet.hairlineWidth,
    outlineColor: COLORS.borderGray,
    outlineStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
  },
  helpBtnHalo: {
    position: 'absolute',
    top: -15,
    left: '50%',
    marginLeft: -52,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.navBg,
    justifyContent: 'center',
    alignItems: 'center',
    outlineWidth: StyleSheet.hairlineWidth,
    outlineColor: COLORS.borderGray,
    outlineStyle: 'solid',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  helpBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.helpMeBtn,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.helpMeBtnShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  helpText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
});

// ── Homepage ──────────────────────────────────────────────────────────────────
type CommunityTab = 'New messages' | 'Chats' | 'Groups';

interface Props {
  firstName?: string;
  token?: string;
}

const HomePage: React.FC<Props> = ({ firstName, token }) => {
  const [communityTab, setCommunityTab] = useState<CommunityTab>('New messages');
  const [showCommunity, setShowCommunity] = useState(false);
  const [showHelpMe, setShowHelpMe] = useState(false);
  const [showManageContacts, setShowManageContacts] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [hasActiveEmergency, setHasActiveEmergency] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  const refreshContacts = () => {
    if (!token) return;
    getEmergencyContacts(token)
      .then(setContacts)
      .catch(() => setContacts([]));
  };

  useEffect(refreshContacts, [token]);

  const communityTabs: CommunityTab[] = ['New messages', 'Chats', 'Groups'];

  const handleEmergency = (type: string) => {
    console.log('Emergency:', type);
    setHasActiveEmergency(true);
  };

  const handleHelpMe = () => {
    setShowHelpMe(true);
  };

  if (showCommunity) {
    return <CommunityPage token={token} />;
  }

  if (showHelpMe) {
    return <HelpMeScreen onCancel={() => setShowHelpMe(false)} />;
  }

  if (showManageContacts) {
    return (
      <ManageContactsPage
        token={token}
        onBack={() => {
          setShowManageContacts(false);
          refreshContacts();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />

      <Animated.View
        style={[styles.flex, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top bar ── */}
          <View style={styles.topBar}>
            <View style={styles.userRow}>
              <View style={styles.avatarWrap} />
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>Hi, {firstName || 'there'}</Text>
                <View style={styles.onlineRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Online</Text>
                </View>
              </View>
            </View>

            {/* Bell */}
            <TouchableOpacity style={styles.bellWrap} activeOpacity={0.75}>
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Tracking card ── */}
          <View style={styles.trackingCard}>
            <View style={styles.trackingLeft}>
              <Text style={styles.trackingLabel}>TRACKING</Text>
              <Text style={styles.trackingStatus} numberOfLines={1}>
                {hasActiveEmergency ? 'Help is on the way' : 'No emergencies'}
              </Text>
              {hasActiveEmergency && <TrackingBars />}
            </View>
            <Image source={require('../../../assets/images/bell.png')} style={styles.trackingIcon} />
          </View>

          {/* ── Emergencies ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Emergencies</Text>
            </View>
            <View style={styles.emergencyRow}>
              <EmergencyBtn label="Ambulance" onPress={() => handleEmergency('Ambulance')} />
              <EmergencyBtn label="Police" onPress={() => handleEmergency('Police')} />
              <EmergencyBtn label="Fire" onPress={() => handleEmergency('Fire')} />
            </View>
          </View>

          {/* ── Community ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Community</Text>
            </View>

            <TouchableOpacity
              style={styles.addContactBtn}
              onPress={() => setShowManageContacts(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.addContactBtnText}>+ Add Contact</Text>
            </TouchableOpacity>

            {/* Tabs */}
            <View style={styles.tabRow}>
              {communityTabs.map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabPill,
                    communityTab === tab ? styles.tabPillActive : styles.tabPillInactive,
                  ]}
                  onPress={() => setCommunityTab(tab)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.tabText,
                      communityTab === tab ? styles.tabTextActive : styles.tabTextInactive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Messages */}
            <View style={styles.messageList}>
              {contacts.length === 0 ? (
                <Text style={styles.emptyText}>No emergency contacts yet</Text>
              ) : (
                contacts.slice(0, 2).map(contact => (
                  <MessageRow
                    key={contact._id}
                    name={contactName(contact)}
                    preview={contact.to.number}
                    time=""
                  />
                ))
              )}
            </View>
          </View>

          {/* bottom padding for nav */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── Bottom Navigation ── */}
        <View style={styles.navWrapper}>
          <BottomNav onHelpMe={handleHelpMe} onChat={() => setShowCommunity(true)} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  flex: { flex: 1 },
  scroll: { paddingBottom: 16 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.trackingBg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userInfo: { gap: 1 },
  greeting: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.onlineGreen,
  },
  onlineText: { fontSize: 12, color: COLORS.mediumGray },

  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.badgeBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadgeText: { fontSize: 9, color: '#FFF', fontWeight: '700' },

  // Tracking card
  trackingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.trackingBg,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  trackingLeft: { flex: 1, flexShrink: 1 },
  trackingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.mediumGray,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  trackingStatus: { fontSize: 16, fontWeight: '700', color: COLORS.black },
  trackingIcon: { width: 44, height: 44, resizeMode: 'contain', flexShrink: 0 },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  addContactBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cardBg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  addContactBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Emergency row
  emergencyRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    flexWrap: 'wrap',
  },

  // Community tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabPillActive: { backgroundColor: COLORS.tabActivePill },
  tabPillInactive: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  tabText: { fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  tabTextInactive: { color: COLORS.darkGray },

  // Message list
  messageList: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  emptyText: {
    padding: 16,
    fontSize: 13,
    color: COLORS.mediumGray,
    textAlign: 'center',
  },

  // Nav wrapper
  navWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
