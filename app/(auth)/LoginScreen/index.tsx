import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { auth, db } from '../../../firebase';
import { InputField } from './components/InputField';
import { styles } from './styles';


export default function LoginScreen() {

  // State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showpassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const router = useRouter();


  // Listens for keyboard visibility to adjust UI padding dynamically.
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);


  //Validates if the email belongs to the HCDC domain and password meets criteria.
  const validateInputs = () => {
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


  // Firestore Logic
  const updateUserProfile = async (uid: string, emailStr: string | null, isNewUser: boolean) => {
    const userRef = doc(db, 'users', uid);
    const data = isNewUser 
      ? { uid, email: emailStr, createdAt: serverTimestamp() } 
      : { uid, email: emailStr, lastLogin: serverTimestamp() };
    
    await setDoc(userRef, data, { merge: true });
  };


  // Authentication  
  const performLogin = async () => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    if (!userCredential.user.emailVerified) {
      Alert.alert('Verification Required', 'Please verify your HCDC email first!');
      return;
    }

    await updateUserProfile(userCredential.user.uid, userCredential.user.email, false);
    router.replace('/(tabs)/home');
  };


  // Handles the registration flow and triggers verification email.
  const performSignup = async () => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateUserProfile(userCredential.user.uid, userCredential.user.email, true);
    await sendEmailVerification(userCredential.user);
    Alert.alert('Success', 'Verification email sent! Check your HCDC email.');
  };
  

  // Management for the authentication process.
  const handleAuth = async () => {
    if (!validateInputs()) return;

    try {
      if (isLogin) {
        await performLogin();
      } else {
        await performSignup();
      }
      resetForm();
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    }
  };


  // Clears all input fields.
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };


  //Renders the logo and header text based on auth state.
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.logo, { marginBottom: 10 }]}>
        Cross<Text style={{ color: '#AF0B01' }}>Rent</Text>
      </Text>
      <Text style={styles.heroHeader}>
        {isLogin ? 'Welcome Back' : 'Get Started'}
      </Text>
      <Text style={[styles.quote, { marginTop: 10 }]}>
        Exclusive for Holy Cross of Davao College users.
      </Text>
    </View>
  );


  // Returns dynamic padding based on keyboard and auth state.
  const getContainerPadding = () => {
    return keyboardVisible && !isLogin ? { paddingTop: 40 } : { paddingTop: 140 };
  };

  
  // Main Render
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.inner, getContainerPadding()]}>
            
            {renderHeader()}

            {/* Spacer preserving the vertical gap previously occupied by AuthToggle */}
            <View style={{ marginBottom: 70 }} />

            <View style={styles.form}>
              <InputField 
                label="EMAIL ADDRESS"
                placeholder="name@hcdc.edu.ph"
                value={email}
                onChangeText={setEmail}
              />

              <InputField 
                label="PASSWORD"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showpassword}
                showPasswordToggle
                isPasswordVisible={showpassword}
                onToggleVisibility={() => setShowPassword(!showpassword)}
              />

              {!isLogin && (
                <InputField 
                  label="CONFIRM PASSWORD"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  showPasswordToggle
                  isPasswordVisible={showConfirmPassword}
                  onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              )}

              <TouchableOpacity style={styles.mainActionBtn} onPress={handleAuth}>
                <Text style={styles.mainActionText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => setIsLogin(!isLogin)}
              >
                <Text style={styles.forgotText}>
                  {isLogin
                    ? "Don't have an account? Sign up here."
                    : "Already have an account? Sign in here."}
                </Text>
              </TouchableOpacity>

              <View style={styles.footerLogoContainer}>
                <Image 
                  source={require('../../../assets/hcdc_logo.png')} 
                  style={styles.footerLogo}
                />
              </View>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}