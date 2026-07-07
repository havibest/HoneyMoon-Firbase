import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  User,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

import {
  getUser,
  createUser,
} from "@/services/user.service";

import { UserProfile } from "@/types/user";

type AuthContextType = {
  firebaseUser: User | null;
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  const [user, setUser] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser) => {
        if (!fbUser) {
          setFirebaseUser(null);
          setUser(null);
          setLoading(false);
          return;
        }

        setFirebaseUser(fbUser);

        let profile = await getUser(fbUser.uid);

        if (!profile) {
          await createUser({
            uid: fbUser.uid,
            email: fbUser.email ?? "",

            displayName: fbUser.displayName ?? "",

            firstName: "",

            lastName: "",

            country: "",

            city: "",

            bio: "",

            photos: [],

            interests: [],

            admin: false,

            isAi: false,

            verified: false,

            active: true,

            online: true,

            profileCompleted: false,

            subscriptionStatus: "inactive",

            paymentStatus: "pending",

            paymentMode: "",

            paymentReference: "",

            referralChoice: "",

            referralCode: "",

            referredBy: "",

            referralCount: 0,
          });

          profile = await getUser(fbUser.uid);
        }

        setUser(profile);

        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);

  if (!ctx)
    throw new Error(
      "useAuthContext must be inside AuthProvider"
    );

  return ctx;
}