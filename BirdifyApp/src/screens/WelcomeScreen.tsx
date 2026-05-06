import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 66, 18, 0.25)', // Forest Green tint overlay
    padding: Spacing.xl,
    justifyContent: 'flex-end',
  },
  content: {
    marginBottom: Spacing.xxl * 2,
  },
  title: {
    fontSize: 42,
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.canvasPure,
    lineHeight: 52,
  },
  footer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  signUpButton: {
    backgroundColor: Colors.canvasPure,
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: Typography.fontSize.md,
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.primary,    // Forest Green
  },
  loginButton: {
    backgroundColor: Colors.container, // Misty Pine
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: Typography.fontSize.md,
    fontFamily: 'PlusJakartaSans-Bold',
    color: Colors.canvasPure,
  },
});
