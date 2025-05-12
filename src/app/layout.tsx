import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fitrackz - Your Personal Fitness Companion",
  description:
    "Track your fitness journey with Fitrackz, your personal fitness companion for a healthier lifestyle",
  icons: [{
    url: "/img/favicon/favicon.ico",
    type: "image/x-icon",
  }]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
