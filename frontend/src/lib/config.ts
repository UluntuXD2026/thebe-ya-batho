import { Platform } from 'react-native';

// Backend runs on your machine during development. localhost only resolves
// correctly on web/iOS simulator; Android emulator needs 10.0.2.2, and a
// physical device needs your machine's LAN IP (e.g. 192.168.x.x).
// Override by setting EXPO_PUBLIC_API_URL in frontend/.env.
//const DEV_HOST = "thebe-ya-batho-backend-production.up.railway.app";

export const API_BASE_URL = "https://thebe-ya-batho-backend-production.up.railway.app"
