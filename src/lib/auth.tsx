import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types";
type AuthValue = {
  user: User | null;
  token: string | null;
  signIn: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  signOut: () => void;
};
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("guardian_token"),
  );
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("guardian_user") ?? "null");
    } catch {
      return null;
    }
  });
  const value = useMemo(
    () => ({
      user,
      token,
      signIn: (nextToken: string, nextUser: User) => {
        localStorage.setItem("guardian_token", nextToken);
        localStorage.setItem("guardian_user", JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      updateUser: (nextUser: User) => {
        localStorage.setItem("guardian_user", JSON.stringify(nextUser));
        setUser(nextUser);
      },
      signOut: () => {
        localStorage.removeItem("guardian_token");
        localStorage.removeItem("guardian_user");
        setToken(null);
        setUser(null);
      },
    }),
    [user, token],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider missing");
  return value;
};
