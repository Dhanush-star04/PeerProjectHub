import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7UeANW2TdjKy3DxbGFU_IL4Mf6_Lcg-Q",
  authDomain: "peerprojecthub-2e2f7.firebaseapp.com",
  projectId: "peerprojecthub-2e2f7",
  storageBucket: "peerprojecthub-2e2f7.firebasestorage.app",
  messagingSenderId: "983160183728",
  appId: "1:983160183728:web:8591bee009749b635d5475",
  measurementId: "G-BNLV251XS8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase automatically keeps track of the logged-in user
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Get a fresh Firebase ID token
          const idToken = await currentUser.getIdToken();

          setUser(currentUser);
          setToken(idToken);

          // Keep email for the existing owner-check logic
          localStorage.setItem('userEmail', currentUser.email);

          console.log('Firebase user authenticated:', currentUser.email);
        } catch (error) {
          console.error('Error getting Firebase token:', error);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('userEmail');
      }

      setLoading(false);
    });

    // Cleanup Firebase listener
    return () => unsubscribe();
  }, []);

  const syncUser = async (idToken) => {
    try {
      await fetch('https://peerprojecthub.onrender.com/api/users/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('User sync error:', err);
    }
  };

  const signup = async (email, password) => {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const idToken = await userCred.user.getIdToken();

    setUser(userCred.user);
    setToken(idToken);

    localStorage.setItem('userEmail', email);

    await syncUser(idToken);

    return idToken;
  };

  const login = async (email, password) => {
    const userCred = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const idToken = await userCred.user.getIdToken();

    setUser(userCred.user);
    setToken(idToken);

    localStorage.setItem('userEmail', email);

    await syncUser(idToken);

    return idToken;
  };

  const logout = async () => {
    try {
      await signOut(auth);

      setUser(null);
      setToken(null);

      localStorage.removeItem('firebaseToken');
      localStorage.removeItem('userEmail');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}