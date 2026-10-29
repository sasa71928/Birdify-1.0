import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface NewSightingsContextType {
  hasNewPosts: boolean;
  newPostIds: Set<string>;
  clearNewPosts: () => void;
}

const NewSightingsContext = createContext<NewSightingsContextType>({
  hasNewPosts: false,
  newPostIds: new Set(),
  clearNewPosts: () => {},
});

export function NewSightingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.id) {
      setNewPostIds(new Set());
      setHasNewPosts(false);
      return;
    }

    const channel = supabase
      .channel(`sightings-global-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sightings',
        },
        (payload) => {
          const newId = (payload.new as any)?.id;
          const authorId = (payload.new as any)?.user_id;
          if (!newId || authorId === user.id) return;

          setNewPostIds((prevIds) => {
            if (prevIds.has(newId)) return prevIds;
            const next = new Set(prevIds);
            next.add(newId);
            return next;
          });
          setHasNewPosts(true);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user?.id]);

  const clearNewPosts = useCallback(() => {
    setNewPostIds(new Set());
    setHasNewPosts(false);
  }, []);

  return (
    <NewSightingsContext.Provider value={{ hasNewPosts, newPostIds, clearNewPosts }}>
      {children}
    </NewSightingsContext.Provider>
  );
}

export function useNewSightings() {
  return useContext(NewSightingsContext);
}
