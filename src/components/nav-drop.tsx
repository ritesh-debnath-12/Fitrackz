"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LoginLink,
  RegisterLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { KindeUser } from "@/app/context/SessionContext";

interface SessionProps {
  isUserAuthenticated: boolean;
  user: KindeUser | null;
}

export function ProfileDrop({ isUserAuthenticated, user }: SessionProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {user?.picture ? (
          <Image src={user.picture} width={32} height={32} alt={user.given_name || "Profile"} className="rounded-full" />
        ) : (
          <Image src="/img/header/placeholder_profile.jpg" width={32} height={32} alt="Profile" className="rounded-full" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isUserAuthenticated ? (
          <>
            <DropdownMenuItem>
              <Link href="/dashboard" className="w-full">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogoutLink className="w-full">Logout</LogoutLink>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem>
              <LoginLink className="w-full">Login</LoginLink>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <RegisterLink className="w-full">Register</RegisterLink>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
