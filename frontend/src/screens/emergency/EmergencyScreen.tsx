import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import { API_BASE_URL } from "../../lib/config";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2YTJmYzEzNWIzYTJhZjRiNzAwOThlYjAiLCJpYXQiOjE3ODE3NzQzODMsImV4cCI6MTc4NDM2NjM4M30.8a5WQnXcjQ1row3L1Zid5rKd5E5eSfpM-4esVklKc50";

interface Props {
  emergency: any;
  onHome: () => void;
}

const EmergencyScreen: React.FC<Props> = ({ emergency, onHome }) => {
  const [name, setName] = useState("");
  const [locationName, setLocationName] = useState("Loading...");
  const [status, setStatus] = useState("");

  console.log(emergency);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffDays === 0) {
      return `Today, ${time}`;
    }

    if (diffDays === 1) {
      return `Yesterday, ${time}`;
    }

    if (diffDays < 7) {
      return `${diffDays} days ago, ${time}`;
    }

    return (
      date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
      }) + `, ${time}`
    );
  };

  const getLocationName = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );

      const data = await res.json();

      const shortName =
        data.address?.suburb ||
        data.address?.city ||
        data.address?.town ||
        data.address?.county;

      return shortName || "Unknown location";
    } catch (err) {
      return "Unknown location";
    }
  };

  useEffect(() => {
    const getName = async function getName() {
      const res = await fetch(
        `${API_BASE_URL}/contacts/get-name/${emergency.data.sender}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      setName(data.name);
    };

    const loadLocation = async () => {
      const { lat, lng } = emergency.data.location;
      const name = await getLocationName(lat, lng);
      setLocationName(name);
    };

    const checkStatus = async (emergency: any) => {
      const data = await fetch(
        `${API_BASE_URL}/emergency/getEmergencyFromId/${emergency.data.emergencyId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const res = await data.json();
      setStatus(res.status);
    };

    getName();
    loadLocation();
    checkStatus(emergency)
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      {/* <MapView
        style={styles.map}
        initialRegion={{
          latitude: emergency.data.location.lat,
          longitude: emergency.data.location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker 
          coordinate={{
            latitude: emergency.data.location.lat,
            longitude: emergency.data.location.lng
          }}
          title="Emergency"
          description={`${emergency.data.type} emergency`}
        />
        </MapView> */}
      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        <Text style={styles.title}>{status === "resolved" ? "Emergency already resolved": "Emergency"}</Text>

        <Text style={styles.description}>
          {name} has triggered an emergency for a {emergency.data.type} !
        </Text>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{locationName}</Text>
          </View>

          <View>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{formatTime(emergency.data.time)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.attendButton}>
          <Text style={styles.attendButtonText}>{status === "resolved" ? "Attend Emergency(resolved)": "Attend Emergency"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneButton} onPress={onHome}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EmergencyScreen;

const COLORS = {
  primary: "#F16D5D",
  dark: "#27235C",
  white: "#FFFFFF",
  border: "#F16D5D",
  textSecondary: "#D5D5D5",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: COLORS.dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },

  handle: {
    width: 50,
    height: 5,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },

  description: {
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    fontSize: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },

  value: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },

  attendButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  attendButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },

  doneButton: {
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },

  doneButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
