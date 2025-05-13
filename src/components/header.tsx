"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { ProfileDrop } from "./nav-drop";
import { useTheme } from "next-themes";
import { useSession } from "@/app/context/SessionContext";

export function Header() {
  const { isUserAuthenticated, user } = useSession();
  const { theme, systemTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(
      theme === "dark" || (theme === "system" && systemTheme === "dark")
    );
  }, [theme, systemTheme]);
  
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            {isDarkMode ? (
              <Image src="/img/header/icon_dark.png" alt="Fitrackz" width={120} height={100}/>
            ) : (
              <Image src="/img/header/icon_light.png" alt="Fitrackz" width={120} height={100}/>
            )}
          </Link>
        </div>
        <nav className="flex space-x-4 items-center">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <ProfileDrop isUserAuthenticated={isUserAuthenticated} user={user} />
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
