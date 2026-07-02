import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
  Image,
  Linking,
  Modal,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { jwtDecode } from "jwt-decode";
import { io, Socket } from "socket.io-client";

import {
  EmergencyContact,
  getEmergencyContacts,
  getReceivedContactRequests,
} from "../../lib/api";
import { Responsive, useResponsive } from "../../constants/responsive";
import { MaxContentWidth } from "../../constants/theme";
import { useHardwareBack } from "../../hooks/useHardwareBack";
import { API_BASE_URL } from "../../lib/config";
import CommunityPage from "../community/CommunityPage";
import ManageContactsPage from "../community/ManageContactsPage";
import HelpMeScreen from "../emergency/HelpMeScreen";
import PastEmergenciesScreen from "../emergency/PastEmergenciesScreen";
import EmergencyScreen from "../emergency/EmergencyScreen";
import ProfileScreen from "./Profilescreen";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { savePushToken } from "../../lib/api";

type MyToken = {
  userid: string;
  iat: number;
  exp: number;
};

const contactName = (contact: EmergencyContact) =>
  [contact.to.firstName, contact.to.lastName].filter(Boolean).join(" ") ||
  contact.to.number;

const COLORS = {
  primary: "#E8573A",
  primaryDark: "#C94428",
  navyDark: "#1E2D4E",
  black: "#111111",
  darkGray: "#333333",
  mediumGray: "#777777",
  lightGray: "#AAAAAA",
  borderGray: "#E8E8E8",
  pageBg: "#F5F5F5",
  cardBg: "#FFFFFF",
  trackingBg: "#EEEEEE",
  trackingBar: "#E8573A",
  trackingBarInactive: "#F2C0B5",
  onlineGreen: "#34C759",
  badgeBg: "#E8573A",
  tabActivePill: "#E8573A",
  tabInactive: "#EEEEEE",
  helpMeBtn: "#E8573A",
  helpMeBtnShadow: "#C94428",
  navBg: "#FFFFFF",
  unreadBadge: "#E8573A",
  activeBlue: "#3B5BDB",
};

// ── Tracking progress bars ────────────────────────────────────────────────────
const TrackingBars: React.FC = () => (
  <View style={tb.row}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={[tb.bar, i <= 2 ? tb.barActive : tb.barInactive]} />
    ))}
  </View>
);
const tb = StyleSheet.create({
  row: { flexDirection: "row", gap: 4, marginTop: 8, alignSelf: "flex-start" },
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
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: COLORS.cardBg,
  },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.black },
});

// ── Community message row ─────────────────────────────────────────────────────
interface MessageRowProps {
  name: string;
  preview: string;
  time: string;
  unread?: number;
  onPress?: () => void;
}
const MessageRow: React.FC<MessageRowProps> = ({
  name,
  preview,
  time,
  unread,
  onPress,
}) => (
  <TouchableOpacity style={msg.row} activeOpacity={0.75} onPress={onPress}>
    <View style={msg.avatar} />
    <View style={msg.body}>
      <View style={msg.topRow}>
        <Text style={msg.name}>{name}</Text>
        <Text style={msg.time}>{time}</Text>
      </View>
      <View style={msg.bottomRow}>
        <Text style={msg.preview} numberOfLines={1}>
          {preview}
        </Text>
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
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  body: { flex: 1 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  name: { fontSize: 15, fontWeight: "600", color: COLORS.black },
  time: { fontSize: 12, color: COLORS.lightGray },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  preview: { fontSize: 13, color: COLORS.mediumGray, flex: 1, marginRight: 8 },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.unreadBadge,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { fontSize: 11, color: "#FFF", fontWeight: "700" },
});

// ── Home icon ─────────────────────────────────────────────────────────────────
const homeXml = (
  color: string,
) => `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 29.3333V16H20V29.3333M4 12L16 2.66666L28 12V26.6667C28 27.3739 27.719 28.0522 27.219 28.5523C26.7189 29.0524 26.0406 29.3333 25.3333 29.3333H6.66667C5.95942 29.3333 5.28115 29.0524 4.78105 28.5523C4.28095 28.0522 4 27.3739 4 26.6667V12Z" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const HomeIcon: React.FC<{ color?: string }> = ({ color = "white" }) => (
  <SvgXml xml={homeXml(color)} width={22} height={22} />
);

// ── Message circle icon ───────────────────────────────────────────────────────
const messageCircleXml = (
  color: string,
) => `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28 15.3333C28.0046 17.0932 27.5934 18.8292 26.8 20.4C25.8592 22.2823 24.413 23.8656 22.6233 24.9724C20.8335 26.0792 18.771 26.6659 16.6667 26.6667C14.9068 26.6713 13.1708 26.2601 11.6 25.4667L4 28L6.53333 20.4C5.73991 18.8292 5.32875 17.0932 5.33333 15.3333C5.33415 13.229 5.92082 11.1665 7.02763 9.37674C8.13444 7.58701 9.71767 6.14076 11.6 5.20001C13.1708 4.40658 14.9068 3.99542 16.6667 4.00001H17.3333C20.1125 4.15333 22.7374 5.32636 24.7055 7.29449C26.6737 9.26262 27.8467 11.8875 28 14.6667V15.3333Z" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const MessageCircleIcon: React.FC<{ color?: string }> = ({
  color = "#29274D",
}) => <SvgXml xml={messageCircleXml(color)} width={22} height={22} />;

// ── Bottom Nav ────────────────────────────────────────────────────────────────
const BottomNav: React.FC<{
  onHelpMe: () => void;
  onChat: () => void;
  r: Responsive;
}> = ({ onHelpMe, onChat, r }) => {
  const iconCircleSize = r.moderateScale(48);
  const haloSize = r.moderateScale(104);
  const helpBtnSize = r.moderateScale(90);

  return (
    <View style={nav.wrap}>
      {/* Home */}
      <TouchableOpacity style={nav.tab} activeOpacity={0.7}>
        <View
          style={[
            nav.iconCircleActive,
            {
              width: iconCircleSize,
              height: iconCircleSize,
              borderRadius: iconCircleSize / 2,
            },
          ]}
        >
          <HomeIcon color="white" />
        </View>
      </TouchableOpacity>

      {/* Chat */}
      <TouchableOpacity style={nav.tab} activeOpacity={0.7} onPress={onChat}>
        <View
          style={[
            nav.iconCircleOutline,
            {
              width: iconCircleSize,
              height: iconCircleSize,
              borderRadius: iconCircleSize / 2,
            },
          ]}
        >
          <MessageCircleIcon color={COLORS.navyDark} />
        </View>
      </TouchableOpacity>

      {/* Help Me FAB */}
      <View
        style={[
          nav.helpBtnHalo,
          {
            width: haloSize,
            height: haloSize,
            borderRadius: haloSize / 2,
            marginLeft: -haloSize / 2,
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={[
            nav.helpBtn,
            {
              width: helpBtnSize,
              height: helpBtnSize,
              borderRadius: helpBtnSize / 2,
            },
          ]}
          onPress={onHelpMe}
          activeOpacity={0.85}
        >
          <Text style={nav.helpText}>Help Me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const nav = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 5,
    marginHorizontal: 32,
    marginBottom: 16,
    borderRadius: 37,
    backgroundColor: COLORS.navBg,
    position: "relative",
    outlineWidth: StyleSheet.hairlineWidth,
    outlineColor: COLORS.borderGray,
    outlineStyle: "solid",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  tab: { alignItems: "center" },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navyDark,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleActive: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navyDark,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleOutline: {
    width: 48,
    height: 48,
    borderRadius: 24,
    outlineWidth: StyleSheet.hairlineWidth,
    outlineColor: COLORS.borderGray,
    outlineStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
  },
  helpBtnHalo: {
    position: "absolute",
    top: -15,
    left: "50%",
    marginLeft: -52,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.navBg,
    justifyContent: "center",
    alignItems: "center",
    outlineWidth: StyleSheet.hairlineWidth,
    outlineColor: COLORS.borderGray,
    outlineStyle: "solid",
    shadowColor: "#000",
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
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.helpMeBtnShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  helpText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 20,
  },
});

// ── Homepage ──────────────────────────────────────────────────────────────────
type CommunityTab = "New messages" | "Chats" | "Groups" | "Contacts";

type Notification = {
  _id: string;
  read: boolean;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  user: string;
  data: any;
};

interface Props {
  firstName?: string;
  lastName?: string;
  number?: string;
  token?: string;
  onLogout?: () => void;
}

const HomePage: React.FC<Props> = ({
  firstName,
  lastName,
  number,
  token,
  onLogout,
}) => {
  const r = useResponsive();
  const socketRef = useRef<Socket | null>(null);

  const [showProfile, setShowProfile] = useState(false);

  const [communityTab, setCommunityTab] =
    useState<CommunityTab>("New messages");
  const [showCommunity, setShowCommunity] = useState(false);
  const [showHelpMe, setShowHelpMe] = useState(false);
  const [showManageContacts, setShowManageContacts] = useState(false);
  const [manageContactsTab, setManageContactsTab] = useState<
    "add" | "requests"
  >("add");
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [hasActiveEmergency, setHasActiveEmergency] = useState(false);

  const [showPastEmergencies, setShowPastEmergencies] = useState(false);
  const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeNotification, setActiveNotification] =
    useState<Notification | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  async function getNotifications() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Notification[] = await res.json();
      setNotifications(data.filter((item) => item.read === false));
    } catch {
      setNotifications([]);
    }
  }

  async function markAsRead(id: string) {
    if (!token) return;
    await fetch(`${API_BASE_URL}/notifications/mark-read/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    getNotifications();
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Live notifications via socket — only once we actually have a token.
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let status = existing;
        if (status !== "granted") {
          ({ status } = await Notifications.requestPermissionsAsync());
        }
        if (status !== "granted") return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const pushToken = (
          await Notifications.getExpoPushTokenAsync({ projectId })
        ).data;

        await savePushToken(token, pushToken);
      } catch (err) {
        console.log("Push registration failed:", err);
      }
    })();

    let userId: string | undefined;
    try {
      userId = jwtDecode<MyToken>(token).userid;
    } catch {
      return;
    }

    getNotifications();

    const socket = io(API_BASE_URL);
    socketRef.current = socket;

    socket.emit("register", userId);
    socket.on("newNotification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setActiveNotification(notification);
      setShowEmergencyModal(true);
    });

    return () => {
      socket.off("newNotification");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const refreshContacts = () => {
    if (!token) return;
    getEmergencyContacts(token)
      .then(setContacts)
      .catch(() => setContacts([]));
  };

  useEffect(refreshContacts, [token]);

  const refreshPendingRequests = () => {
    if (!token) return;
    getReceivedContactRequests(token)
      .then((all) =>
        setPendingRequestCount(
          all.filter((req) => req.status === "pending").length,
        ),
      )
      .catch(() => setPendingRequestCount(0));
  };

  useEffect(refreshPendingRequests, [token]);

  const communityTabs: CommunityTab[] = [
    "New messages",
    "Chats",
    "Groups",
    "Contacts",
  ];

  const handleEmergency = (type: string) => {
    console.log("Emergency:", type);
    setHasActiveEmergency(true);
  };

  const handleAttendEmergency = () => {
    setShowEmergencyModal(false);
    if (activeNotification) {
      markAsRead(activeNotification._id);
      setSelectedEmergency(activeNotification);
      setShowEmergencyScreen(true);
    }
    setActiveNotification(null);
  };

  const handleCancelEmergency = () => {
    setShowEmergencyModal(false);
    setActiveNotification(null);
  };

  const handleHelpMe = () => {
    setShowHelpMe(true);
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Hardware back inside Home's sub-views returns to the Home hub; at the
  // hub itself there's no previous in-app page, so let the OS default happen.
  useHardwareBack(
    useCallback(() => {
      if (showProfile) {
        setShowProfile(false);
        return true;
      }
      if (showManageContacts) {
        setShowManageContacts(false);
        refreshContacts();
        refreshPendingRequests();
        return true;
      }
      if (showEmergencyScreen) {
        setShowEmergencyScreen(false);
        setSelectedEmergency(null);
        return true;
      }
      if (showNotifications) {
        setShowNotifications(false);
        return true;
      }
      if (showPastEmergencies) {
        setShowPastEmergencies(false);
        return true;
      }
      if (showHelpMe) {
        setShowHelpMe(false);
        return true;
      }
      if (showCommunity) {
        setShowCommunity(false);
        return true;
      }
      return false;
    }, [
      showProfile,
      showManageContacts,
      showEmergencyScreen,
      showNotifications,
      showPastEmergencies,
      showHelpMe,
      showCommunity,
    ]),
  );

  if (showPastEmergencies) {
    return (
      <PastEmergenciesScreen
        token={token}
        onHome={() => setShowPastEmergencies(false)}
        onHelpMe={() => {
          setShowPastEmergencies(false);
          setShowHelpMe(true);
        }}
        onChat={() => {
          setShowPastEmergencies(false);
          setShowCommunity(true);
        }}
      />
    );
  }

  if (showCommunity) {
    return (
      <CommunityPage token={token} onBack={() => setShowCommunity(false)} />
    );
  }

  if (showHelpMe) {
    return <HelpMeScreen onCancel={() => setShowHelpMe(false)} token={token} />;
  }

  if (showManageContacts) {
    return (
      <ManageContactsPage
        token={token}
        initialTab={manageContactsTab}
        onBack={() => {
          setShowManageContacts(false);
          refreshContacts();
          refreshPendingRequests();
        }}
      />
    );
  }

  if (showProfile) {
    return (
      <ProfileScreen
        firstName={firstName}
        token={token}
        onBack={() => setShowProfile(false)}
        onLogout={() => {
          setShowProfile(false);
          onLogout?.();
        }}
      />
    );
  }

  if (showNotifications) {
    return (
      <SafeAreaView style={styles.notificationScreen}>
        <View style={styles.notificationHeader}>
          <TouchableOpacity
            onPress={() => setShowNotifications(false)}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.notificationHeaderTitle}>Notifications</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.notificationContent}>
          {notifications.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.notificationItem}
              onPress={() => {
                setShowEmergencyModal(true);
                setActiveNotification(item);
                setShowNotifications(false);
              }}
            >
              <Text style={styles.notificationHead}>{item.title}</Text>
              <Text style={styles.notificationBody}>{item.data?.type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showEmergencyScreen) {
    return (
      <EmergencyScreen
        emergency={selectedEmergency}
        token={token}
        onHome={() => {
          setShowEmergencyScreen(false);
          setSelectedEmergency(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pageBg} />

      <Animated.View
        style={[
          styles.flex,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            { width: "100%", maxWidth: MaxContentWidth, alignSelf: "center" },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top bar ── */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.userRow}
              activeOpacity={0.75}
              onPress={() => setShowProfile(true)}
            >
              <View
                style={[
                  styles.avatarWrap,
                  {
                    width: r.moderateScale(36),
                    height: r.moderateScale(36),
                    borderRadius: r.moderateScale(18),
                  },
                ]}
              />
              <View style={styles.userInfo}>
                <Text
                  style={[styles.greeting, { fontSize: r.moderateScale(15) }]}
                >
                  Hi, {firstName || "there"}
                </Text>
                <View style={styles.onlineRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Online</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Bell */}
            <TouchableOpacity
              style={[
                styles.bellWrap,
                {
                  width: r.moderateScale(44),
                  height: r.moderateScale(44),
                  borderRadius: r.moderateScale(22),
                },
              ]}
              activeOpacity={0.75}
              onPress={handleNotifications}
            >
              {notifications.length > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>
                    {notifications.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Tracking card ── */}
          <View style={styles.trackingCard}>
            <View style={styles.trackingLeft}>
              <Text style={styles.trackingLabel}>TRACKING</Text>
              <Text
                style={[
                  styles.trackingStatus,
                  { fontSize: r.moderateScale(16) },
                ]}
                numberOfLines={1}
              >
                {hasActiveEmergency ? "Help is on the way" : "No emergencies"}
              </Text>
              {hasActiveEmergency && <TrackingBars />}
            </View>
            <Image
              source={require("../../../assets/images/bell.png")}
              style={[
                styles.trackingIcon,
                { width: r.moderateScale(44), height: r.moderateScale(44) },
              ]}
            />
          </View>

          <TouchableOpacity
            style={styles.pastEmergenciesBtn}
            onPress={() => setShowPastEmergencies(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.pastEmergenciesTitle}>Past Emergencies</Text>
            <Text style={styles.pastEmergenciesSubtitle}>
              View your emergency history and responses
            </Text>
          </TouchableOpacity>

          {/* ── Emergencies ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[styles.sectionTitle, { fontSize: r.moderateScale(22) }]}
              >
                Emergencies
              </Text>
            </View>
            <View style={styles.emergencyRow}>
              <EmergencyBtn
                label="Ambulance"
                onPress={() => handleEmergency("Ambulance")}
              />
              <EmergencyBtn
                label="Police"
                onPress={() => handleEmergency("Police")}
              />
              <EmergencyBtn
                label="Fire"
                onPress={() => handleEmergency("Fire")}
              />
            </View>
          </View>

          {/* ── Community ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[styles.sectionTitle, { fontSize: r.moderateScale(22) }]}
              >
                Community
              </Text>
            </View>

            <View style={styles.contactBtnRow}>
              <TouchableOpacity
                style={styles.addContactBtn}
                onPress={() => {
                  setManageContactsTab("add");
                  setShowManageContacts(true);
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.addContactBtnText}>+ Add Contact</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.requestsBtn}
                onPress={() => {
                  setManageContactsTab("requests");
                  setShowManageContacts(true);
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.requestsBtnText}>Requests</Text>
                {pendingRequestCount > 0 && (
                  <View style={styles.requestsBadge}>
                    <Text style={styles.requestsBadgeText}>
                      {pendingRequestCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              {communityTabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabPill,
                    communityTab === tab
                      ? styles.tabPillActive
                      : styles.tabPillInactive,
                  ]}
                  onPress={() => setCommunityTab(tab)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.tabText,
                      communityTab === tab
                        ? styles.tabTextActive
                        : styles.tabTextInactive,
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
                (communityTab === "Contacts"
                  ? contacts
                  : contacts.slice(0, 2)
                ).map((contact) => (
                  <MessageRow
                    key={contact._id}
                    name={contactName(contact)}
                    preview={contact.to.number}
                    time=""
                    onPress={
                      communityTab === "Contacts"
                        ? () => Linking.openURL(`tel:${contact.to.number}`)
                        : undefined
                    }
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
          <BottomNav
            onHelpMe={handleHelpMe}
            onChat={() => setShowCommunity(true)}
            r={r}
          />
        </View>
      </Animated.View>

      <Modal
        visible={showEmergencyModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelEmergency}
      >
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.card}>
            <Text style={modalStyles.title}>
              {activeNotification?.title || "New Notification"}
            </Text>
            <Text style={modalStyles.body}>
              {activeNotification?.body ||
                "A new emergency notification was received."}
            </Text>

            <View style={modalStyles.btnRow}>
              <TouchableOpacity
                style={modalStyles.cancelBtn}
                onPress={handleCancelEmergency}
                activeOpacity={0.8}
              >
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={modalStyles.attendBtn}
                onPress={handleAttendEmergency}
                activeOpacity={0.8}
              >
                <Text style={modalStyles.attendText}>Attend Emergency</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: "#000",
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
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  userInfo: { gap: 1 },
  greeting: { fontSize: 15, fontWeight: "700", color: COLORS.black },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5 },
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
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bellBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.badgeBg,
    justifyContent: "center",
    alignItems: "center",
  },
  bellBadgeText: { fontSize: 9, color: "#FFF", fontWeight: "700" },

  // Tracking card
  trackingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "700",
    color: COLORS.mediumGray,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  trackingStatus: { fontSize: 16, fontWeight: "700", color: COLORS.black },
  trackingIcon: { width: 44, height: 44, resizeMode: "contain", flexShrink: 0 },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.black,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  contactBtnRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
  },
  addContactBtn: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.cardBg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addContactBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  requestsBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  requestsBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  requestsBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  requestsBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
  },

  // Emergency row
  emergencyRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    flexWrap: "wrap",
  },

  // Community tabs
  tabRow: {
    flexDirection: "row",
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
  tabText: { fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#FFF" },
  tabTextInactive: { color: COLORS.darkGray },

  // Message list
  messageList: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  emptyText: {
    padding: 16,
    fontSize: 13,
    color: COLORS.mediumGray,
    textAlign: "center",
  },

  // Nav wrapper
  navWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  pastEmergenciesBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pastEmergenciesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 4,
  },
  pastEmergenciesSubtitle: {
    fontSize: 13,
    color: COLORS.mediumGray,
  },

  notificationScreen: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderGray,
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  notificationHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
  },
  notificationContent: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: COLORS.cardBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderGray,
  },
  notificationHead: {
    fontSize: 15,
    color: COLORS.darkGray,
    fontWeight: "bold",
  },
  notificationBody: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginBottom: 20,
    lineHeight: 20,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.darkGray,
  },
  attendBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  attendText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
});
