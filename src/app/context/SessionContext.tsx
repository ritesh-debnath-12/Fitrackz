"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface KindeUser {
  id: string;
  given_name: string | null;
  family_name: string | null;
  email: string | null;
  picture: string | null;
}

interface SessionContextType {
  isUserAuthenticated: boolean;
  user: KindeUser | null;
}

const SessionContext = createContext<SessionContextType>({
  isUserAuthenticated: false,
  user: null,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionContextType>({
    isUserAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setSession(data);
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setSession({ isUserAuthenticated: false, user: null });
      }
    };

    fetchSession();
  }, []);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
