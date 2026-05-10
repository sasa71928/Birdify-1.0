import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import BottomNavBar from '../../components/BottomNavBar';
import shared from '../../styles/shared/shared.styles';
import styles from '../../styles/screens/bird/recordSightingScreen.styles';

export default function RecordSightingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [birdName, setBirdName] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your gallery to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = () => {
    if (!birdName.trim()) {
      Alert.alert('Missing info', 'Please enter a bird name.');
      return;
    }
    
    // Simulate successful post
    Alert.alert('Sighting Posted!', 'Your sighting has been shared with the community.', [
      { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Feed' }) }
    ]);
  };

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
        <Text style={styles.title}>Record Sighting</Text>
        <Text style={styles.subtitle}>Log your latest observation for your life list.</Text>

        {/* Photo Upload Area */}
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.photoInner}>
              <View style={styles.cameraIconBg}>
                  <Ionicons name="camera-outline" size={32} color={Colors.primary} />
                  <View style={styles.plusIconBadge}>
                      <Ionicons name="add" size={12} color={Colors.primary} />
                  </View>
              </View>
              <Text style={styles.photoTitle}>Tap to add photo</Text>
              <Text style={styles.photoSubtitle}>High quality images help identification</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={styles.label}>Identify Bird</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search species or enter unknown..."
              placeholderTextColor={Colors.placeholder}
              value={birdName}
              onChangeText={setBirdName}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Observation Notes</Text>
          <View style={styles.notesContainer}>
            <TextInput 
              style={styles.notesInput}
              placeholder="What was it doing? Describe its behavior, song, or habitat..."
              placeholderTextColor={Colors.placeholder}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.locationHeader}>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity style={styles.useCurrentBtn}>
              <MaterialCommunityIcons name="target" size={18} color={Colors.primary} />
              <Text style={styles.useCurrentText}>Use current</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapContainer}>
            <Image 
              source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-73.9653,40.7829,14,0/600x300?access_token=pk.eyJ1IjoiY2hpdHUiLCJhIjoiY2tobnVnZzJvMGNxZzJzbXowam1vM3Z1ciJ9.9_n6rFv_Y0Z_X_1_1_1_1' }} 
              style={styles.mapImage} 
            />
            <View style={styles.mapPin}>
                <Ionicons name="location" size={30} color="#1B4D3E" />
            </View>
            <TouchableOpacity style={styles.adjustPinBtn}>
              <Ionicons name="location-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.adjustPinText}>Adjust Pin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Private Location Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <MaterialCommunityIcons name="eye-off-outline" size={22} color={Colors.textSecondary} />
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Private Location</Text>
              <Text style={styles.toggleSubtitle}>Hide exact coordinates from public feed</Text>
            </View>
          </View>
          <Switch 
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: '#DDE3E0', true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        {/* Post Button */}
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Ionicons name="paper-plane" size={20} color={Colors.white} style={styles.postIcon} />
          <Text style={styles.postButtonText}>Post Sighting</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>

      <BottomNavBar />
    </SafeAreaView>
  );
}

