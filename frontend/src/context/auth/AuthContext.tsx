import { createContext } from "react";

import type { User } from "../../types";
import type { Credentials } from "../../api/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: Credentials) => Promise<void>;
  signup: (data: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
