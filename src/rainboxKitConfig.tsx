"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { sepolia, anvil, zksync } from "wagmi/chains"

export default getDefaultConfig({   
    appName: "TSender",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID!, 
    chains: [sepolia, anvil, zksync],
    ssr: false
}) 