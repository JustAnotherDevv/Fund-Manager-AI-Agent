import { useState } from "react";
import { AIFundsList } from "./AIFundList.tsx";
import { UserFunds } from "./UserFunds";
import { FundDetails } from "./FundDetails";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Address } from "viem";
import { useWeb3 } from "@/hooks/useWeb3";

export const UserDashboard = () => {
  const { isConnected } = useWeb3();
  const [selectedFund, setSelectedFund] = useState<Address | null>(null);

  const handleFundSelect = (fundAddress: Address) => {
    setSelectedFund(fundAddress);
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="mb-6 text-gray-600">
            Connect your wallet to manage your AI funds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Fund Manager</h1>

      <Tabs defaultValue="funds" className="space-y-6">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="funds">My Funds</TabsTrigger>
          <TabsTrigger value="create">Create Fund</TabsTrigger>
          {selectedFund && (
            <TabsTrigger value="details">Fund Details</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="funds" className="space-y-6">
          <section>
            <div className="mb-6">
              <UserFunds onSelectFund={handleFundSelect} />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="create">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Create New AI Fund</h2>
              <div className="mb-6">
                <AIFundsList />
              </div>
            </section>
          </div>
        </TabsContent>

        {selectedFund && (
          <TabsContent value="details">
            <div className="space-y-8">
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Fund Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFund(null)}
                  >
                    Close
                  </Button>
                </div>
                <FundDetails fundAddress={selectedFund} />
              </section>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
