import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/firebaseErrors';

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  profileSyncedUid: string | null;
  signingIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureUserProfileDoc(currentUser: User): Promise<void> {
  const path = `users/${currentUser.uid}`;
  const userRef = doc(db, 'users', currentUser.uid);

  const displayName = (
    currentUser.displayName ||
    currentUser.email?.split('@')[0] ||
    'Founder'
  ).slice(0, 120);
  const email = (currentUser.email || '').slice(0, 254);
  const photoURL = currentUser.photoURL
    ? currentUser.photoURL.slice(0, 512)
    : undefined;

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (!existingSnap.exists()) {
    const createPayload: Record<string, unknown> = {
      uid: currentUser.uid,
      displayName,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (photoURL) {
      createPayload.photoURL = photoURL;
    }

    try {
      await setDoc(userRef, createPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  } else {
    const updatePayload: Record<string, unknown> = {
      displayName,
      email,
      updatedAt: serverTimestamp(),
    };
    if (photoURL) {
      updatePayload.photoURL = photoURL;
    }

    try {
      await updateDoc(userRef, updatePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
}

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileSyncedUid, setProfileSyncedUid] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (cancelled) return;
      setUser(nextUser);
      setProfileSyncedUid(null);

      if (nextUser && nextUser.emailVerified) {
        try {
          await ensureUserProfileDoc(nextUser);
          if (!cancelled) {
            setProfileSyncedUid(nextUser.uid);
            setAuthError(null);
          }
        } catch (err) {
          if (!cancelled) {
            setAuthError(
              err instanceof Error
                ? err.message
                : 'Unable to initialize your user profile in Firestore.'
            );
          }
        }
      }

      if (!cancelled) {
        setAuthReady(true);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: unknown }).code)
          : '';
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        // User dismissed the sign-in popup deliberately
      } else if (code === 'auth/popup-blocked') {
        setAuthError(
          'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.'
        );
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError(
          'This domain is not authorized for Google Sign-In in Firebase Auth settings.'
        );
      } else {
        setAuthError(
          error instanceof Error
            ? error.message
            : 'Unable to sign in with Google right now.'
        );
      }
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setProfileSyncedUid(null);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Failed to sign out cleanly.'
      );
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        profileSyncedUid,
        signingIn,
        authError,
        clearAuthError,
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return ctx;
}
