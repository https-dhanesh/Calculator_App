import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { supabase } from '../supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert("Login Failed", error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert("Error", error.message);
    else Alert.alert("Success", "Account created! You can now log in.");
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Calculator App</Title>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        autoCapitalize="none"
        style={styles.input}
      />

      <Button 
        mode="contained" 
        onPress={signInWithEmail} 
        loading={loading}
        style={styles.button}
      >
        Login
      </Button>

      <Button 
        mode="outlined" 
        onPress={signUpWithEmail} 
        disabled={loading}
        style={styles.button}
      >
        Sign Up
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { textAlign: 'center', marginBottom: 20, fontSize: 24, fontWeight: 'bold' },
  input: { marginBottom: 10 },
  button: { marginTop: 10 },
});