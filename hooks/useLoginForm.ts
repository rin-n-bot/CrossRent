import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert } from 'react-native';
import { auth, db } from '../firebase';

export const useLoginForm = () => {
  const [isLogin, setIsLogin]                         = useState(true);
  const [email, setEmail]                             = useState('');
  const [password, setPassword]                       = useState('');
  const [confirmPassword, setConfirmPassword]         = useState('');
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { refreshUser } = useAuth();
  const router = useRouter();

  const toggleMode                      = () => setIsLogin((p) => !p);
  const togglePasswordVisibility        = () => setShowPassword((p) => !p);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((p) => !p);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const validate = (): boolean => {
    if (!email.endsWith('@hcdc.edu.ph')) {
      Alert.alert('Validation Error', 'Only HCDC email is allowed');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }
    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const saveUser = async (uid: string, userEmail: string | null, isNewUser: boolean) => {
    const data = isNewUser
      ? { uid, email: userEmail, createdAt: serverTimestamp() }
      : { uid, email: userEmail, lastLogin: serverTimestamp() };
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  };

  const login = async () => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);

  await user.reload();
  await user.getIdToken(true);

  const freshUser = await refreshUser();

  if (!freshUser?.emailVerified) {
    await signOut(auth);
    Alert.alert('Verification Required', 'Please verify your HCDC email first!');
    return;
  }

  await saveUser(freshUser.uid, freshUser.email, false);
  router.replace('/(tabs)/home');
};

  const signup = async () => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await saveUser(user.uid, user.email, true);
  await sendEmailVerification(user);
  await signOut(auth);

  Alert.alert('Success', 'Verification email sent! Check your HCDC email.');
};

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (isLogin) { await login(); } else { await signup(); }
      resetForm();
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    }
  };

  return {
    isLogin,
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSubmit,
    toggleMode,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  };
};