import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type AuthValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  username: string | null;
};

const AuthContext = createContext<AuthValue>({
  user: null,
  session: null,
  loading: true,
  username: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) {
      setUsername(null);
      return;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setUsername(data?.username ?? null);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, username }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
