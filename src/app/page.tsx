"use client";

import HomeContents from "@/components/HomeContents";
import { useAccount } from "wagmi";

export default function Home() {

  const { isConnected } = useAccount();

  return (
      <div>
        { !isConnected ? (
          <div className="flex items-center justify-center h-screen text-5xl text-orange-500">
            Please connect to wallet!
          </div>
        ) : (
          <HomeContents />
        )}
        
      </div>
  );
}
