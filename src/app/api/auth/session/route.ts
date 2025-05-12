import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  try {
    const session = await getKindeServerSession();
    const user = await session.getUser();
    const isAuthenticated = await session.isAuthenticated();

    return NextResponse.json({
      isUserAuthenticated: isAuthenticated,
      user: user ? {
        id: user.id,
        given_name: user.given_name,
        family_name: user.family_name,
        email: user.email,
        picture: user.picture
      } : null
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({
      isUserAuthenticated: false,
      user: null
    });
  }
} 