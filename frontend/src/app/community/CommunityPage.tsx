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
  FlatList,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import HelpMeScreen from '../emergency/HelpMeScreen';
import HomePage from '../homepage/HomePage';
import InboxPage from './InboxPage';

const COLORS = {
  primary: '#E8573A',
  primaryDark: '#C94428',
  navyDark: '#1E2D4E',
  black: '#111111',
  darkGray: '#222222',
  mediumGray: '#777777',
  lightGray: '#AAAAAA',
  borderGray: '#EEEEEE',
  pageBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  tabActiveBg: '#E8573A',
  tabInactiveBg: '#FFFFFF',
  unreadBlue: '#3B5BDB',
  unreadRed: '#E8573A',
  navBg: '#FFFFFF',
  activeBlue: '#3B5BDB',
};

// ── Types ─────────────────────────────────────────────────────────────────────
type FilterTab = 'All' | 'Unread' | 'Chats' | 'Groups';

interface Conversation {
  id: string;
  name: string;
  preview: string;
  time: string;
  avatarBg: string;
  unread?: number;
  unreadColor?: string;
  bold?: boolean;
  type: 'chat' | 'group';
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Keamogetswe',
    preview: 'Be on the look out for a blue Vw polo...',
    time: '14:23',
    avatarBg: '#C9A87C',
    unread: 1,
    unreadColor: COLORS.unreadBlue,
    bold: true,
    type: 'chat',
  },
  {
    id: '2',
    name: 'Sam',
    preview: 'Please leave your phone when you go...',
    time: 'Yesterday',
    avatarBg: '#B5845A',
    type: 'chat',
  },
  {
    id: '3',
    name: 'Precious',
    preview: 'There is a blue vw polo robbing people...',
    time: 'Tuesday',
    avatarBg: '#7D9B6A',
    type: 'chat',
  },
  {
    id: '4',
    name: 'Sebokeng 10',
    preview: 'Good job on yesterday\'s patrol we man...',
    time: 'Tuesday',
    avatarBg: '#4A6FA5',
    unread: 5,
    unreadColor: COLORS.unreadRed,
    type: 'group',
  },
  {
    id: '5',
    name: 'Sam',
    preview: 'Please leave your phone when you go...',
    time: 'Yesterday',
    avatarBg: '#B5845A',
    type: 'chat',
  },
  {
    id: '6',
    name: 'Precious',
    preview: 'There is a blue vw polo robbing people...',
    time: 'Friday',
    avatarBg: '#7D9B6A',
    type: 'chat',
  },
  {
    id: '7',
    name: 'Sechaba Patrol',
    preview: 'Patrol schedule group has been sent to ...',
    time: 'Friday',
    avatarBg: '#C4783A',
    type: 'group',
  },
];

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ bg: string }> = ({ bg }) => (
  <View style={[av.wrap, { backgroundColor: bg }]} />
);
const av = StyleSheet.create({
  wrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

// ── Conversation row ──────────────────────────────────────────────────────────
const ConversationRow: React.FC<{ item: Conversation; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={cr.wrap} activeOpacity={0.7} onPress={onPress}>
    <Avatar bg={item.avatarBg} />
    <View style={cr.body}>
      <View style={cr.topRow}>
        <Text style={cr.name}>{item.name}</Text>
        <Text style={cr.time}>{item.time}</Text>
      </View>
      <View style={cr.bottomRow}>
        <Text
          style={[cr.preview, item.bold && cr.previewBold]}
          numberOfLines={1}
        >
          {item.preview}
        </Text>
        {!!item.unread && (
          <View style={[cr.badge, { backgroundColor: item.unreadColor ?? COLORS.unreadBlue }]}>
            <Text style={cr.badgeText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);
const cr = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderGray,
    backgroundColor: COLORS.cardBg,
  },
  body: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.darkGray },
  time: { fontSize: 12, color: COLORS.lightGray },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: { fontSize: 13, color: COLORS.mediumGray, flex: 1, marginRight: 8 },
  previewBold: { fontWeight: '600', color: COLORS.darkGray },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
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
const BottomNav: React.FC<{ onHome: () => void; onHelpMe: () => void }> = ({ onHome, onHelpMe }) => (
  <View style={nav.wrap}>
    <TouchableOpacity style={nav.tab} activeOpacity={0.7} onPress={onHome}>
      <View style={nav.iconCircleSolid}>
        <HomeIcon color={COLORS.navyDark} />
      </View>
    </TouchableOpacity>

    <TouchableOpacity style={nav.tab} activeOpacity={0.7}>
      <View style={nav.iconCircleActive}>
        <MessageCircleIcon color="white" />
      </View>
    </TouchableOpacity>

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
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
  },
  iconCircleSolid: {
    width: 48,
    height: 48,
    borderRadius: 24,
    outlineWidth: StyleSheet.hairlineWidth,
    outlineColor: COLORS.borderGray,
    outlineStyle: 'solid',
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  helpText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});

// ── Community Page ────────────────────────────────────────────────────────────
const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [showHome, setShowHome] = useState(false);
  const [showHelpMe, setShowHelpMe] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const TABS: FilterTab[] = ['All', 'Unread', 'Chats', 'Groups'];

  const filtered = CONVERSATIONS.filter(c => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !!c.unread;
    if (activeTab === 'Chats') return c.type === 'chat';
    if (activeTab === 'Groups') return c.type === 'group';
    return true;
  });

  if (activeChat) {
    return (
      <InboxPage
        contactName={activeChat.name}
        onBack={() => setActiveChat(null)}
      />
    );
  }

  if (showHome) {
    return <HomePage />;
  }

  if (showHelpMe) {
    return <HelpMeScreen onCancel={() => setShowHelpMe(false)} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />

      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
        </View>

        {/* ── Filter tabs ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
          style={styles.tabRow}
        >
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabPill,
                activeTab === tab ? styles.tabPillActive : styles.tabPillInactive,
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}

          {/* + new group button */}
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.75}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── Conversation list ── */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ConversationRow item={item} onPress={() => setActiveChat(item)} />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />

        {/* ── Bottom nav ── */}
        <View style={styles.navWrapper}>
          <BottomNav onHome={() => setShowHome(true)} onHelpMe={() => setShowHelpMe(true)} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default CommunityPage;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  flex: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.black,
  },

  tabRow: {
    marginBottom: 4,
  },
  tabScroll: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  tabPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
  },
  tabPillActive: {
    backgroundColor: COLORS.tabActiveBg,
  },
  tabPillInactive: {
    backgroundColor: COLORS.tabInactiveBg,
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  tabTextInactive: { color: COLORS.darkGray },

  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 26,
    marginTop: -2,
  },

  navWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
