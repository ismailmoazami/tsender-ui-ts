"use client";

import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 shadow-md bg-white">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png" // Make sure this image exists in your public/ folder
          alt="TSender Logo"
          width={40}
          height={40}
        />
        <span className="text-2xl font-bold text-gray-800">TSender</span>
      </div>
      <ConnectButton />
    </header>
  );
}
