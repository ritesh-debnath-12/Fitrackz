"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSessionData } from "../actions/auth";

interface SessionContextType {
  isUserAuthenticated: boolean;
  user: any;
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
        const sessionData = await getSessionData();
        setSession(sessionData);
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
