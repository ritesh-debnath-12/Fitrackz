"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

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
        const kindeSession = await getKindeServerSession();
        const user = await kindeSession.getUser();
        const isUserAuthenticated = await kindeSession.isAuthenticated();
        setSession({ 
          isUserAuthenticated, 
          user: user ? {
            id: user.id,
            given_name: user.given_name,
            family_name: user.family_name,
            email: user.email,
            picture: user.picture
          } : null 
        });
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
