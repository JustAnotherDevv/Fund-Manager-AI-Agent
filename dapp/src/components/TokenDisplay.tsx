import { usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { web3Caller } from "@/lib/web3Caller";
import { Address } from "viem";

type TokenDisplayProps = {
  tokenAddress: Address;
  showAddress?: boolean;
};

export const TokenDisplay = ({
  tokenAddress,
  showAddress = false,
}: TokenDisplayProps) => {
  const [symbol, setSymbol] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    const getSymbol = async () => {
      try {
        setIsLoading(true);
        const tokenSymbol = await web3Caller.getTokenSymbol(
          publicClient,
          tokenAddress
        );
        setSymbol(tokenSymbol);
      } catch (error) {
        console.error("Failed to get token symbol:", error);
        setSymbol(
          tokenAddress.substring(0, 6) +
            "..." +
            tokenAddress.substring(tokenAddress.length - 4)
        );
      } finally {
        setIsLoading(false);
      }
    };

    getSymbol();
  }, [tokenAddress, publicClient]);

  if (isLoading) {
    return <span className="animate-pulse">Loading...</span>;
  }

  if (showAddress) {
    return (
      <span title={tokenAddress}>
        {symbol}{" "}
        <span className="text-xs text-gray-500">
          ({tokenAddress.substring(0, 6)}...
          {tokenAddress.substring(tokenAddress.length - 4)})
        </span>
      </span>
    );
  }

  return <span title={tokenAddress}>{symbol}</span>;
};
