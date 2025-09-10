"use client";

import Image from "next/image";
import Link from "next/link";
import useScroll from "@/lib/hooks/use-scroll";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Gamepad2, TrendingUp } from "lucide-react";

export default function NavBar() {
  const scrolled = useScroll(50);

  return (
    <>
      <div
        className={`fixed top-0 flex w-full justify-center ${
          scrolled
            ? "border-b border-gray-200 bg-white/75 backdrop-blur-xl"
            : "bg-white/0"
        } z-30 transition-all`}
      >
        <div className="mx-5 flex h-16 w-full max-w-screen-xl items-center justify-between">
          <Link href="/" className="flex items-center font-display text-2xl">
            <Image
              src="/logo.png"
              alt="Alphi logo"
              width="30"
              height="30"
              className="mr-2 rounded-sm"
            ></Image>
            <p className="text-orange-600 font-bold">🎯 Alphi</p>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/jeu" 
              className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              <span>🎮</span>
              <span>Jouer</span>
            </Link>
            <SignedIn>
              <Link 
                href="/admin" 
                className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                <span>👩‍🏫</span>
                <span>Administration</span>
              </Link>
              <Link 
                href="/progres" 
                className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                <span>📈</span>
                <span>Mes Progrès</span>
              </Link>
            </SignedIn>
          </div>

          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-orange-500 text-white px-4 py-2 rounded-full font-medium hover:bg-orange-600 transition-colors">
                  Se Connecter
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Tableau de Bord"
                    labelIcon={<LayoutDashboard className="h-4 w-4" />}
                    href="/admin"
                  />
                  <UserButton.Link
                    label="Jouer"
                    labelIcon={<Gamepad2 className="h-4 w-4" />}
                    href="/jeu"
                  />
                  <UserButton.Link
                    label="Mes Progrès"
                    labelIcon={<TrendingUp className="h-4 w-4" />}
                    href="/progres"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
          </div>
        </div>
      </div>
    </>
  );
}
