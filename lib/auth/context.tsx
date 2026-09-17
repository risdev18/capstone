'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import type { UserProfile, UserRole } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
    // Update lastLogin
    await setDoc(
      doc(db, 'users', firebaseUser.uid),
      { lastLogin: serverTimestamp() },
      { merge: true }
    );
    await fetchProfile(firebaseUser.uid);
  };

  const register = async (
    email: string,
    password: string,
    profileData: Partial<UserProfile>
  ) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    if (profileData.name) {
      await updateProfile(firebaseUser, { displayName: profileData.name });
    }
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      name: profileData.name ?? '',
      email,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      lastLogin: now,
      ...profileData,
    };
    await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
    setProfile(newProfile);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role ?? null,
        loading,
        login,
        register,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
