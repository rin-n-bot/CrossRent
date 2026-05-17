import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLoginForm } from '../../../hooks/useLoginForm';
import { useSplashAnimation } from '../../../hooks/useSplashAnimation';
import { InputField } from './components/InputField';
import { SplashAnimation } from './components/SplashAnimation';
import { styles } from './styles';


// Utility to scale sizes based on screen height, using 844 as base height
const { height } = Dimensions.get('window');
const scaleH = (size: number) => (height / 844) * size;


// LoginScreen component
export default function LoginScreen() {
  const form   = useLoginForm();
  const splash = useSplashAnimation();

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const realLogoRef = useRef<Text>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  // Measure the real logo's position on screen after layout
  const onRealLogoLayout = () => {
    setTimeout(() => {
      realLogoRef.current?.measure((_x, _y, w, h, pageX, pageY) => {
        splash.setTargetLayout({ x: pageX, y: pageY, w, h });
      });
    }, 50);
  };

  const containerPadding = keyboardVisible && !form.isLogin
    ? { paddingTop: scaleH(40) }
    : { paddingTop: scaleH(140) };


  // Main LoginScreen renderer
  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.inner, containerPadding, { opacity: splash.contentOpacity }]}>
            <View style={styles.header}>

              {/* Real logo — hidden under splash overlay during animation */}
              <Text
                ref={realLogoRef}
                onLayout={onRealLogoLayout}
                style={[styles.logo, { marginBottom: 10 }]}
              >
                Cross<Text style={{ color: '#AF0B01' }}>Rent</Text>
              </Text>

              <Text style={styles.heroHeader}>
                {form.isLogin ? 'Welcome Back' : 'Get Started'}
              </Text>

              <Text style={[styles.quote, { marginTop: 10 }]}>
                Exclusive for Holy Cross of Davao College users.
              </Text>
              
            </View>
            <View style={{ marginBottom: 70 }} />

            <View style={styles.form}>
              <InputField
                label="EMAIL ADDRESS"
                placeholder="name@hcdc.edu.ph"
                value={form.email}
                onChangeText={form.setEmail}
              />

              <InputField
                label="PASSWORD"
                placeholder="••••••••"
                value={form.password}
                onChangeText={form.setPassword}
                secureTextEntry={!form.showPassword}
                showPasswordToggle
                isPasswordVisible={form.showPassword}
                onToggleVisibility={form.togglePasswordVisibility}
              />
              
              {!form.isLogin && (
                <InputField
                  label="CONFIRM PASSWORD"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChangeText={form.setConfirmPassword}
                  secureTextEntry={!form.showConfirmPassword}
                  showPasswordToggle
                  isPasswordVisible={form.showConfirmPassword}
                  onToggleVisibility={form.toggleConfirmPasswordVisibility}
                />
              )}

              <TouchableOpacity style={styles.mainActionBtn} onPress={form.handleSubmit}>
                <Text style={styles.mainActionText}>
                  {form.isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotBtn} onPress={form.toggleMode}>
                <Text style={styles.forgotText}>
                  {form.isLogin
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

          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Splash — both logo coords are screen-absolute so delta is exact on any device */}
      <SplashAnimation
        logoX={splash.logoX}
        logoY={splash.logoY}
        spinnerOpacity={splash.spinnerOpacity}
        bgOpacity={splash.bgOpacity}
        spin={splash.spin}
        onLogoLayout={splash.setSplashLogoLayout}
        visible={splash.phase !== 'done'}
      />

    </SafeAreaView>
  );
}