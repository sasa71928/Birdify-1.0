import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import styles from '../../styles/screens/auth/welcomeScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: 'https://s3-us-west-1.amazonaws.com/manomexicana/596fa7e843e40f13f388df3225f8d926.jpg' }}
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title}>The best{"\n"}app for{"\n"}your birding</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.signUpText}>Sign up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

