import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Address } from "viem";
import { TokenBalance } from "@/lib/contracts/types";
import { SupportedTokens } from "./SupportedTokens";

type FundDetails = {
  address: Address;
  owner: Address;
  manager: Address;
  balances: TokenBalance[];
};

export const UserFunds = () => {
  const {
    getUserFunds,
    getAllBalances,
    account,
    isConnected,
    isLoading,
    error,
  } = useWeb3();

  const [funds, setFunds] = useState<Address[]>([]);
  const [fundDetails, setFundDetails] = useState<Record<string, FundDetails>>(
    {}
  );
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>(
    {}
  );

  // Fetch user's funds
  useEffect(() => {
    const fetchFunds = async () => {
      if (isConnected) {
        const userFunds = await getUserFunds();
        setFunds(userFunds);

        // Initialize loading states
        const initialLoadingState: Record<string, boolean> = {};
        userFunds.forEach((fund) => {
          initialLoadingState[fund] = true;
        });
        setLoadingDetails(initialLoadingState);
      }
    };

    fetchFunds();
  }, [isConnected, account]);

  // Fetch details for each fund
  useEffect(() => {
    const fetchFundDetails = async () => {
      const details: Record<string, FundDetails> = {};

      await Promise.all(
        funds.map(async (fundAddress) => {
          try {
            // For a complete implementation, you would need to add these functions to your web3Caller
            // Here I'm showing the pattern you would use
            const [balances] = await Promise.all([getAllBalances(fundAddress)]);

            details[fundAddress] = {
              address: fundAddress,
              owner: account as Address, // We know the user is the owner
              manager: "0x0000000000000000000000000000000000000000", // You would fetch this
              balances,
            };
          } catch (error) {
            console.error(
              `Error fetching details for fund ${fundAddress}:`,
              error
            );
          } finally {
            setLoadingDetails((prev) => ({
              ...prev,
              [fundAddress]: false,
            }));
          }
        })
      );

      setFundDetails(details);
    };

    if (funds.length > 0) {
      fetchFundDetails();
    }
  }, [funds]);

  const refreshFunds = async () => {
    if (isConnected) {
      const userFunds = await getUserFunds();
      setFunds(userFunds);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Connect your wallet to view your funds</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading your funds...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={refreshFunds} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (funds.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">You don't have any funds yet.</p>
        <p className="mt-2">Create a fund to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Funds</h2>
        <Button onClick={refreshFunds} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {funds.map((fundAddress) => (
          <Card key={fundAddress}>
            <CardHeader>
              <CardTitle>Fund</CardTitle>
              <CardDescription className="font-mono text-xs">
                {fundAddress}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loadingDetails[fundAddress] ? (
                <div className="py-4 text-center">Loading fund details...</div>
              ) : fundDetails[fundAddress] ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Balances</h3>
                    {fundDetails[fundAddress].balances.length > 0 ? (
                      <div className="space-y-2">
                        {fundDetails[fundAddress].balances.map(
                          (balance, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-2 bg-secondary/20 rounded-md"
                            >
                              <span className="font-medium">
                                {balance.symbol ||
                                  balance.token.substring(0, 6)}
                              </span>
                              <span>
                                {/* Format balance with decimals */}
                                {balance.balance.toString()} {balance.symbol}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No tokens in this fund yet.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-red-500">
                  Error loading fund details
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button size="sm">Deposit</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
