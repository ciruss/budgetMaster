import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { api } from "../../api/api";
import { queryKeys } from "../../api/queryKeys";
import {
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useSignupMutation,
} from "../../api/queries";
import type { Credentials } from "../../api/types";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() =>
    Boolean(sessionStorage.getItem("token"))
  );
  const meQuery = useMeQuery(hasToken);
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const logoutMutation = useLogoutMutation();

  const login = async (data: Credentials) => {
    await loginMutation.mutateAsync(data);
    setHasToken(true);
    await queryClient.fetchQuery({
      queryKey: queryKeys.auth.me(),
      queryFn: () => api.me(),
    });
  };

  const signup = async (data: Credentials) => {
    await signupMutation.mutateAsync(data);
    await login(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    setHasToken(false);
    queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
    queryClient.removeQueries({ queryKey: queryKeys.summary.all });
    queryClient.removeQueries({ queryKey: queryKeys.budget.all });
    queryClient.removeQueries({ queryKey: queryKeys.transactions.all });
    queryClient.removeQueries({ queryKey: queryKeys.categories.all() });
    queryClient.removeQueries({ queryKey: queryKeys.assets.all() });
    queryClient.removeQueries({ queryKey: ["assets", "snapshots"] });
    queryClient.removeQueries({ queryKey: queryKeys.history.all });
  };

  const value = {
    user: meQuery.data ?? null,
    loading: hasToken ? meQuery.isLoading : false,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!value.loading && children}
    </AuthContext.Provider>
  );
}
