import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function getAuthSession() {
  try {
    const session = await getKindeServerSession();
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getKindeServerSession();
    const user = await session.getUser();
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function isAuthenticated() {
  try {
    const session = await getKindeServerSession();
    return await session.isAuthenticated();
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
} 