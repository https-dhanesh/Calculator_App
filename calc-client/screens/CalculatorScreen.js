import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Divider, List } from 'react-native-paper';
import { supabase } from '../supabase';
import axios from 'axios';

const API_URL = 'http://localhost:3000'; 

export default function CalculatorScreen() {
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchHistory(user.id);
      }
    });
  }, []);

  const fetchHistory = async (uid) => {
    try {
      const response = await axios.get(`${API_URL}/get-history?user_id=${uid}`);
      setHistory(response.data);
    } catch (error) {
      console.log("Error fetching history:", error);
    }
  };

  const handlePress = (val) => {
    if (val === 'C') {
      setExpression('');
    } else if (val === '=') {
      calculateResult();
    } else {
      setExpression((prev) => prev + val);
    }
  };

  const calculateResult = async () => {
    try {
      const result = eval(expression).toString(); 
      
      setExpression(result);
      
      if (userId) {
        await axios.post(`${API_URL}/save-calculation`, {
          user_id: userId,
          expression: expression,
          result: result
        });
        fetchHistory(userId);
      }
    } catch (error) {
      Alert.alert("Invalid Calculation");
      setExpression('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>{expression || "0"}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        {['1', '2', '3', '+'].map((btn) => <CalcButton key={btn} val={btn} onPress={handlePress} />)}
        {['4', '5', '6', '-'].map((btn) => <CalcButton key={btn} val={btn} onPress={handlePress} />)}
        {['7', '8', '9', '*'].map((btn) => <CalcButton key={btn} val={btn} onPress={handlePress} />)}
        {['C', '0', '=', '/'].map((btn) => <CalcButton key={btn} val={btn} onPress={handlePress} />)}
      </View>

      <Divider style={{ marginVertical: 10 }} />
      
      <Text style={styles.historyTitle}>History (Last 10)</Text>
      <ScrollView style={styles.historyContainer}>
        {history.map((item) => (
          <List.Item
            key={item.id}
            title={`${item.expression} = ${item.result}`}
            description={new Date(item.created_at).toLocaleTimeString()}
            left={props => <List.Icon {...props} icon="history" />}
          />
        ))}
      </ScrollView>

      <Button mode="text" onPress={handleLogout} style={{ marginTop: 10 }}>Logout</Button>
    </View>
  );
}

const CalcButton = ({ val, onPress }) => (
  <Button 
    mode="contained" 
    onPress={() => onPress(val)} 
    style={styles.btn} 
    labelStyle={{ fontSize: 20 }}
  >
    {val}
  </Button>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  displayContainer: { height: 80, justifyContent: 'center', alignItems: 'flex-end', backgroundColor: '#fff', marginBottom: 10, padding: 10, borderRadius: 8 },
  displayText: { fontSize: 32, fontWeight: 'bold' },
  buttonsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  btn: { width: '22%', marginVertical: 5, backgroundColor: '#6200ee' },
  historyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  historyContainer: { flex: 1 },
});