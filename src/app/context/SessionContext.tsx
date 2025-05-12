"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

interface KindeUser {
  id: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
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
        const kindeSession = await getKindeServerSession();
        const user = await kindeSession.getUser();
        const isUserAuthenticated = await kindeSession.isAuthenticated();
        setSession({ isUserAuthenticated, user });
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
