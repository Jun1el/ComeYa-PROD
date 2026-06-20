'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

const AuthContext = createContext(null);

async function loadProfile(userId) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, businesses(id)')
      .eq('id', userId)
      .single();
    
    if (error || !profile) return null;
    
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      district: profile.district,
      membership: profile.membership,
      businessName: profile.business_name,
      businessPhone: profile.business_phone,
      businessId: profile.businesses?.id || null,
      avatarUrl: profile.avatar_url
    };
  } catch (err) {
    console.error('Error loading profile:', err);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const loadedProfile = await loadProfile(session.user.id);
        if (loadedProfile) {
          setProfile(loadedProfile);
        } else {
          const metadata = session.user.user_metadata || {};
          setProfile({
            id: session.user.id,
            email: session.user.email,
            fullName: metadata.full_name || session.user.email,
            role: metadata.role || 'customer',
            district: metadata.district || '',
            membership: metadata.membership || 'Free',
            businessName: metadata.business_name || null
          });
        }
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const loadedProfile = await loadProfile(session.user.id);
        if (loadedProfile) {
          setProfile(loadedProfile);
        } else {
          const metadata = session.user.user_metadata || {};
          setProfile({
            id: session.user.id,
            email: session.user.email,
            fullName: metadata.full_name || session.user.email,
            role: metadata.role || 'customer',
            district: metadata.district || '',
            membership: metadata.membership || 'Free',
            businessName: metadata.business_name || null
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const loadedProfile = await loadProfile(user.id);
      if (loadedProfile) {
        setProfile(loadedProfile);
      }
    }
  };

  const value = {
    user,
    profile,
    setProfile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
