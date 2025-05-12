'use server';

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function getSessionData() {
  try {
    const session = await getKindeServerSession();
    const user = await session.getUser();
    const isAuthenticated = await session.isAuthenticated();
    
    return {
      isUserAuthenticated: isAuthenticated,
      user: user
    };
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return {
      isUserAuthenticated: false,
      user: null
    };
  }
} 