import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { SvgXml } from "react-native-svg";

import { API_BASE_URL } from "../../lib/config";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2YTJmYzEzNWIzYTJhZjRiNzAwOThlYjAiLCJpYXQiOjE3ODE3NzQzODMsImV4cCI6MTc4NDM2NjM4M30.8a5WQnXcjQ1row3L1Zid5rKd5E5eSfpM-4esVklKc50";

const COLORS = {
  primary: "#E8573A",
  black: "#111111",
  darkGray: "#333333",
  mediumGray: "#777777",
  borderGray: "#E8E8E8",
  pageBg: "#F5F5F5",
  cardBg: "#FFFFFF",
  navBg: "#FFFFFF",
  helpMeBtn: "#E8573A",
  helpMeBtnShadow: "#C94428",
  navyDark: "#1E2D4E",
};

// ── Icons ─────────────────────────────────────────────
const homeXml = (color: string) => `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
<path d="M12 29.3333V16H20V29.3333M4 12L16 2.66666L28 12V26.6667C28 27.3739 27.719 28.0522 27.219 28.5523C26.7189 29.0524 26.0406 29.3333 25.3333 29.3333H6.66667C5.95942 29.3333 5.28115 29.0524 4.78105 28.5523C4.28095 28.0522 4 27.3739 4 26.6667V12Z"
stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const HomeIcon = () => <SvgXml xml={homeXml("white")} width={22} height={22} />;

const messageXml = (color: string) => `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
<path d="M28 15.3333C28.0046 17.0932 27.5934 18.8292 26.8 20.4C25.8592 22.2823 24.413 23.8656 22.6233 24.9724C20.8335 26.0792 18.771 26.6659 16.6667 26.6667C14.9068 26.6713 13.1708 26.2601 11.6 25.4667L4 28L6.53333 20.4C5.73991 18.8292 5.32875 17.0932 5.33333 15.3333C5.33415 13.229 5.92082 11.1665 7.02763 9.37674C8.13444 7.58701 9.71767 6.14076 11.6 5.20001C13.1708 4.40658 14.9068 3.99542 16.6667 4.00001H17.3333C20.1125 4.15333 22.7374 5.32636 24.7055 7.29449C26.6737 9.26262 27.8467 11.8875 28 14.6667V15.3333Z"
stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const MessageIcon = () => (
  <SvgXml xml={messageXml("#1E2D4E")} width={22} height={22} />
);

type BottomNavProps = {
  onHome: () => void;
  onHelpMe: () => void;
  onChat: () => void;
};

// ── Bottom Nav ─────────────────────────────────────────────
const BottomNav = ({ onHome, onHelpMe, onChat }: BottomNavProps) => {
  return (
    <View style={nav.wrap}>
      <TouchableOpacity style={nav.tab} onPress={onHome}>
        <View style={nav.circleActive}>
          <HomeIcon />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={nav.tab} onPress={onChat}>
        <View style={nav.circleOutline}>
          <MessageIcon />
        </View>
      </TouchableOpacity>

      <View style={nav.helpBtnHalo} pointerEvents="box-none">
        <TouchableOpacity onPress={onHelpMe} style={nav.helpBtn}>
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

  circleActive: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navyDark,
    justifyContent: "center",
    alignItems: "center",
  },

  circleOutline: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    justifyContent: "center",
    alignItems: "center",
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

const PastEmergenciesScreen = ({
  onHome,
  onHelpMe,
  onChat,
}: {
  onHome: () => void;
  onHelpMe: () => void;
  onChat: () => void;
}) => {
  type Emergency = {
    _id: string;
    type: string;
    status: "active" | "resolved";
    createdAt: string;
  };

  const [data, setData] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/emergency/getEmergency`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onResolve = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/emergency/resolve/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    load();
    console.log(data);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.title}>Past Emergencies</Text>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          data.map((item) => (
            <View key={item._id} style={styles.card}>
              <View style={styles.topRow}>
                <Text style={styles.type}>{item.type}</Text>
                <Text
                  style={
                    item.status === "resolved" ? styles.resolved : styles.status
                  }
                >
                  {item.status}
                </Text>
              </View>

              <Text style={styles.time}>{item.createdAt}</Text>
              {item.status === "active" ? (
                <TouchableOpacity style={styles.resolveBtn} activeOpacity={0.8}>
                  <Text
                    style={styles.resolveText}
                    onPress={() => onResolve(item._id)}
                  >
                    Resolve
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomNav onHome={onHome} onHelpMe={onHelpMe} onChat={onChat} />
    </SafeAreaView>
  );
};

export default PastEmergenciesScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },

  list: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 10,
  },

  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  type: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
  },

  status: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
  },

  desc: {
    fontSize: 13,
    color: COLORS.mediumGray,
    marginBottom: 6,
  },

  time: {
    fontSize: 12,
    color: COLORS.mediumGray,
  },
  resolveBtn: {
    alignSelf: "flex-end",
    marginTop: 10,

    backgroundColor: "#E8573A",
    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 20, // makes it pill/circle-ish
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#C94428",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },

  resolveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  resolved: {
    color: "#05a100",
    fontSize: 18,
    fontWeight: "600",
  },
});
