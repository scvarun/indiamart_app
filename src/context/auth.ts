import { createContext, useCallback, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "@/firebase/firebase";
import { FirestoreError } from "firebase/firestore";
import * as authRepo from "@/repo/auth";
import { UserProfile } from "@/models/User";
import { getUserProfile } from "@/repo/auth";
import { useQuery } from "@tanstack/react-query";

export type AuthContextInstance = {
  error: Error | null;
  user: User | null | undefined;
  userProfile: UserProfile | null | undefined;
  isLoading: boolean;
  setError: (err: Error | null) => void;
  login: (creds: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (creds: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
};

export const init: AuthContextInstance = {
  error: null,
  user: undefined,
  userProfile: undefined,
  isLoading: false,
  setError() {},
  async login(creds) {},
  async logout() {},
  async register(creds) {},
};

export const AuthContext = createContext<AuthContextInstance>(init);

export function useAuth(): AuthContextInstance {
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null | undefined>();
  const [userProfile, setUserProfile] = useState<
    UserProfile | null | undefined
  >();
  const [isLoading, setLoading] = useState<boolean>(false);

  const fetchUserProfile = useCallback(async () => {
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      setUserProfile(userProfile);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(
      (user) => setUser(user),
      (err) => setError(new Error(err.message))
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchUserProfile();
    else setUserProfile(undefined);
  }, [fetchUserProfile, user]);

  return {
    user,
    userProfile,
    error,
    setError,
    isLoading,
    async login({ email, password }) {
      try {
        setLoading(true);
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } catch (e) {
        console.error(e);
        if (e instanceof FirestoreError || e instanceof Error) {
          setError(new Error(e.message));
        } else {
          setError(new Error("Unknown error"));
        }
      } finally {
        setLoading(false);
      }
    },
    async logout() {
      await signOut(firebaseAuth);
    },
    async register({ email, password, firstName, lastName }) {
      try {
        setLoading(true);
        const res = await createUserWithEmailAndPassword(
          firebaseAuth,
          email,
          password
        );
        const { user: { uid } } = res;
        const res2 = await authRepo.registerUser({
          email,
          firstName,
          lastName,
          uid,
        });
        setUserProfile(res2);
      } catch (e) {
        console.error(e);
        if (e instanceof FirestoreError || e instanceof Error) {
          setError(new Error(e.message));
        } else {
          setError(new Error("Unknown error"));
        }
      } finally {
        setLoading(false);
      }
    },
  };
}
