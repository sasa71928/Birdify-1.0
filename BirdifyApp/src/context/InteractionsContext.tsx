import React, { createContext, useContext, useEffect, useState } from 'react';
import { DeviceEventEmitter, Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import AppToast from '../components/AppToast';
import FeedItem, { Post } from '../components/FeedItem';
import { mapSightingToPost } from '../hooks/useFeed';
import { Colors, Radius, Spacing, Typography } from '../theme';

interface InteractionsContextType {}

const InteractionsContext = createContext<InteractionsContextType>({});

export function InteractionsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [toast, setToast] = useState<{ visible: boolean; message: string; sightingId?: string }>({ 
    visible: false, 
    message: '' 
  });
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    const handleInteraction = async (payload: any, type: 'comment' | 'reaction') => {
      const newRecord = payload.new;
      if (!newRecord || !newRecord.sighting_id) return;

      const { data } = await supabase
        .from('sightings')
        .select('user_id')
        .eq('id', newRecord.sighting_id)
        .single();

      if (data && data.user_id === session.user.id && newRecord.user_id !== session.user.id) {
        const msg = type === 'comment' 
          ? 'Alguien ha comentado tu avistamiento.' 
          : 'A alguien le ha gustado tu avistamiento.';
          
        setToast({ visible: true, message: msg, sightingId: newRecord.sighting_id });
        
        setTimeout(() => {
          setToast(prev => ({ ...prev, visible: false }));
        }, 5000);
      }
    };

    const channel = supabase
      .channel('interactions-global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => handleInteraction(payload, 'comment')
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reactions' },
        (payload) => handleInteraction(payload, 'reaction')
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const fetchSingleSighting = async (sightingId: string) => {
    setIsLoadingPost(true);
    try {
      const { data, error } = await supabase
        .from('sightings')
        .select(`
          id, user_id, bird_id, description, photo_url,
          latitude, longitude, is_location_private, created_at, updated_at,
          users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
          birds (id, common_name, scientific_name),
          reactions (user_id),
          comments (id)
        `)
        .eq('id', sightingId)
        .single();

      if (error) throw error;
      if (data) {
        const post = mapSightingToPost(data, session?.user?.id);
        setSelectedPost(post);
      }
    } catch (e) {
      console.error('Error fetching single sighting for modal:', e);
    } finally {
      setIsLoadingPost(false);
    }
  };

  const handleToastPress = () => {
    const sightingId = toast.sightingId;
    setToast({ visible: false, message: '' });
    // Emit refresh_feed in background so the list updates anyway
    DeviceEventEmitter.emit('refresh_feed');
    
    if (sightingId) {
      // Show an empty modal first with loading state
      setSelectedPost(null);
      setIsLoadingPost(true); // Open the modal with spinner
      fetchSingleSighting(sightingId);
    }
  };

  return (
    <InteractionsContext.Provider value={{}}>
      {children}
      <AppToast 
        visible={toast.visible} 
        message={toast.message} 
        type="success"
        onPress={handleToastPress}
        onClose={() => setToast({ visible: false, message: '' })}
      />

      <Modal
        visible={selectedPost !== null || isLoadingPost}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setSelectedPost(null);
          setIsLoadingPost(false);
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
          <TouchableOpacity
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={1}
            onPress={() => {
              setSelectedPost(null);
              setIsLoadingPost(false);
            }}
          >
            {isLoadingPost && !selectedPost ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : selectedPost ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                <View onStartShouldSetResponder={() => true}>
                  <FeedItem 
                    post={selectedPost} 
                    onNavigateAway={() => {
                      setSelectedPost(null);
                      setIsLoadingPost(false);
                    }} 
                  />
                </View>
              </ScrollView>
            ) : null}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
            onPress={() => {
              setSelectedPost(null);
              setIsLoadingPost(false);
            }}
          >
            <Ionicons name="close-circle" size={36} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </InteractionsContext.Provider>
  );
}

const styles = StyleSheet.create({});



export function useInteractions() {
  return useContext(InteractionsContext);
}
