import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Address } from "viem";
import { AIManager } from "@/lib/contracts/types";
import { SupportedTokens } from "./SupportedTokens";

export const AIFundsList = () => {
  const {
    getActiveAIManagers,
    getAIManagerDetails,
    createFund,
    isLoading,
    error,
  } = useWeb3();
  const [managers, setManagers] = useState<AIManager[]>([]);

  useEffect(() => {
    const fetchManagers = async () => {
      const managerAddresses = await getActiveAIManagers();

      const managersData = await Promise.all(
        managerAddresses.map(async (address) => {
          const details = await getAIManagerDetails(address);
          console.log("Manager details:", details);
          return details;
        })
      );

      const filteredManagers = managersData.filter(Boolean) as AIManager[];

      // Log with BigInt serialization
      console.log(
        "Filtered managers:",
        JSON.stringify(
          filteredManagers,
          (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          2
        )
      );

      setManagers(filteredManagers);
    };

    fetchManagers();
  }, []);

  const handleCreateFund = async (managerAddress: Address) => {
    try {
      console.log("Creating fund for manager:", managerAddress);
      const result = await createFund(managerAddress);

      if (result) {
        console.log(`Fund created successfully at: ${result.fundAddress}`);
        console.log(`Transaction hash: ${result.transactionHash}`);
        // You might want to redirect to a fund details page or show a success message
      } else {
        console.error("Failed to create fund - no result returned");
      }
    } catch (error) {
      console.error("Error creating fund:", error);
    }
  };

  if (isLoading) {
    return <div>Loading AI fund managers...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {managers.map((manager) => (
        <Card key={manager.implementation}>
          <CardHeader>
            <CardTitle>{manager.name}</CardTitle>
            <CardDescription>{manager.strategy}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{manager.description}</p>
            <div className="mt-4">
              <h4 className="text-sm font-medium">Supported Tokens:</h4>
              <div className="mt-2">
                <SupportedTokens
                  tokens={manager.supportedTokens}
                  symbols={manager.supportedTokenSymbols}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleCreateFund(manager.implementation)}
              className="w-full"
            >
              Create Fund
            </Button>
          </CardFooter>
        </Card>
      ))}

      {managers.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p>No active AI fund managers found.</p>
        </div>
      )}
    </div>
  );
};
