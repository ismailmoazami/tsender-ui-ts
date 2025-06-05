import { useMemo, useState, useEffect } from "react";
import InputField from "./ui/InputField";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { calculateTotal } from "@/utils";

export default function AirdropForm() {
    
    const [tokenAddress, setTokenAddress] = useState(() => {
        if(typeof window !== "undefined") {
            return localStorage.getItem("airdrop_tokenAddress") || "";
        }
        return "";
    });
    const [recipients, setRecipients] = useState(() => {
        if(typeof window !== "undefined") {
            return localStorage.getItem("airdrop_recipients") || "";
        }
        return "";
    });
    const [amounts, setAmounts] = useState(() => {
        if(typeof window !== "undefined") {
            return localStorage.getItem("airdrop_amounts") || "";
        }
        return "";
    });
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
    const { data: hash, isPending, writeContractAsync } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })
    const [tokenName, setTokenName] = useState<string | null>(null);
    const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
    const [isTokenInfoLoading, setIsTokenInfoLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem("airdrop_tokenAddress", tokenAddress);
    }, [tokenAddress]);
    useEffect(() => {
        localStorage.setItem("airdrop_recipients", recipients);
    }, [recipients]);
    useEffect(() => {
        localStorage.setItem("airdrop_amounts", amounts);
    }, [amounts]);

    useEffect(() => {
        
        async function fetchTokenInfo() {
            if (!tokenAddress || !tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
                setTokenName(null);
                setTokenDecimals(null);
                return;
            }

            setIsTokenInfoLoading(true);
            try {
                const [name, decimals] = await Promise.all([
                    readContract(config, {
                        abi: erc20Abi,
                        address: tokenAddress as `0x${string}`,
                        functionName: "name",
                        args: [],
                    }) as Promise<string>,
                    readContract(config, {
                        abi: erc20Abi,
                        address: tokenAddress as `0x${string}`,
                        functionName: "decimals",
                        args: [],
                    }) as Promise<number>,
                ]);
                setTokenName(name);
                setTokenDecimals(decimals);
            } catch (error) {
                console.error("Failed to fetch token info:", error);
                setTokenName(null);
                setTokenDecimals(null);
            } finally {
                setIsTokenInfoLoading(false);
            }
        }

        fetchTokenInfo();
    }, [tokenAddress, config]);

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if(!tSenderAddress) {
            alert("No address found for this chainid!");
        }        
        
        const response = await readContract(
            config,
            {
                abi: erc20Abi, 
                address: tokenAddress as `0x${string}`,
                functionName: "allowance",
                args:[account.address, tSenderAddress as `0x${string}`]
            }
        )
        return response as number;

    } 

    async function getTokenName() {
        const response = await readContract(
            config, 
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "name",
                
            }
        )
        return response as string;
    }

    async function handleSubmit() {

        const tSenderAddress = chainsToTSender[chainId]["tsender"]
        const approvedAmount = await getApprovedAmount(tSenderAddress);
        
        if(approvedAmount < total) {
            const approveHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [tSenderAddress as `0x${string}`, BigInt(total)]
            })
            const txReceipt = await waitForTransactionReceipt(config, {hash: approveHash})
            
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
            
        } else {
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
        }
    }

    return(
        <div className="flex flex-col gap-4 pad-4">
            <InputField
            label="Token Address"
            placeholder="0x"
            value={tokenAddress}
            onChange={e => setTokenAddress(e.target.value)}
            />
            
            <InputField
            label="Recipients"
            placeholder="0x123, 0x456"
            value={recipients}
            onChange={e => setRecipients(e.target.value)}
            large={true} 
            />

            <InputField
            label="Amounts"
            placeholder="100, 200, ...."
            value={amounts}
            onChange={e => setAmounts(e.target.value)}
            large={true} 
            />

            <div className="flex flex-col gap-2 w-full border border-gray-300 rounded-xl p-4 bg-white shadow-sm">
                <label className="text-xl font-bold text-gray-800">Transaction Details</label>
                <label className="text-lg font-semibold text-gray-700">
                    Token Name: {isTokenInfoLoading ? "Loading..." : tokenName || (tokenAddress ? "Invalid or unknown token" : "Enter a token address")}
                </label>
                <label className="text-lg font-semibold text-gray-700">
                    Amount (wei): {tokenDecimals !== null ? (total * Math.pow(10, tokenDecimals)).toLocaleString() : total.toLocaleString() || "Enter amounts"}
                </label>
                <label className="text-lg font-semibold text-gray-700">
                    Amount (Tokens): {total ? total * 10 ** -18 : "Enter amounts"}
                </label>
            </div>
            <button
                onClick={handleSubmit}
                disabled={isPending || isConfirming || !tokenAddress || !recipients || !amounts || !account.address}
                className={`w-full px-4 py-2 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                    isPending || isConfirming || !tokenAddress || !recipients || !amounts || !account.address
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
            >
                {isPending || isConfirming ? (
                    <div className="flex items-center justify-center">
                        <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                            />
                        </svg>
                        Processing...
                    </div>
                ) : (
                    "Send Tokens"
                )}
            </button>

        </div>
    )
}