import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    const channel = supabase
      .channel('sightings-global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sightings',
        },
        async (payload) => {
          const newId = payload.new?.id;
          const authorId = payload.new?.user_id;
          if (!newId) return;

          // Sesión local en caché, sin llamada al servidor
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id === authorId) return;

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
      }
    };
  }, []);

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