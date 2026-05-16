import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onToggleVisibility?: () => void;
}


// Standardized input field with optional password visibility toggle
export const InputField = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry, 
  showPasswordToggle, 
  isPasswordVisible, 
  onToggleVisibility 
}: InputFieldProps) => {


  // Renders the password-specific input with an eye icon
  const renderPasswordInput = () => (
    <View style={styles.passwordInputContainer}>
      <TextInput 
        style={{ flex: 1, color: '#1D3557', fontSize: 16 }}
        placeholder={placeholder}
        placeholderTextColor="#DDE5E7"
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={onToggleVisibility}>
        <Ionicons 
          name={isPasswordVisible ? "eye" : "eye-off"} 
          size={20} 
          color="#222D31" 
        />
      </TouchableOpacity>
    </View>
  );


  // Renders the standard text input field
  const renderStandardInput = () => (
    <TextInput 
      placeholder={placeholder} 
      style={styles.input}
      placeholderTextColor="#DDE5E7"
      autoCapitalize="none"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  );

  return (
    <View style={styles.inputBox}>
      
      {/* field label */}
      <View style={styles.labelWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
      </View>

      {/* password input content */}
      {showPasswordToggle ? renderPasswordInput() : renderStandardInput()}
      
    </View>
  );
};