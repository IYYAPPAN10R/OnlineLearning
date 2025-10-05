import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, provider } from '../config/firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Save user to MongoDB
  const saveUserToMongoDB = async (user) => {
    try {
      await axios.post(`${API_BASE_URL}/users`, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving user to MongoDB:', error);
    }
  };

  const markActive = async (user) => {
    try {
      if (!user) return;
      const response = await axios.get(`${API_BASE_URL}/users/${user.uid}/heartbeat`, {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`
        }
      });
    } catch (e) {
      // non-blocking
    }
  };

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await saveUserToMongoDB(result.user);
    await markActive(result.user);
    return result;
  };

  // Sign in with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password).then(async (res) => {
      // ensure backend record and mark active
      await saveUserToMongoDB(res.user);
      await markActive(res.user);
      return res;
    });
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserToMongoDB(result.user);
      await markActive(result.user);
      return result;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Heartbeat to mark user active every 60s
  useEffect(() => {
    if (!currentUser) return;
    const sendHeartbeat = async () => {
      try {
        await axios.post(`http://localhost:5002/api/users/${currentUser.uid}/heartbeat`, {}, {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`
          }
        });
      } catch (e) {
        // non-blocking
      }
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
