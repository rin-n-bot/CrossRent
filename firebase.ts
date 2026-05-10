import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
//@ts-ignore
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBQsOCnGcqn3V4yvNXR59l8ybbno507uUk",
  authDomain: "crossrent-app.firebaseapp.com",
  projectId: "crossrent-app",
  storageBucket: "crossrent-app.firebasestorage.app",
  messagingSenderId: "132854871631",
  appId: "1:132854871631:web:2f6b078f3565626e6d5c3a"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);