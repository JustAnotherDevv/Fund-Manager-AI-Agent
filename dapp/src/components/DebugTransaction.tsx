import { useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIFundRegistryABI } from "@/lib/contracts/abi.ts";

export const DebugTransaction = () => {
  const [registryAddress, setRegistryAddress] = useState("");
  const [managerAddress, setManagerAddress] = useState("");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const handleTest = async () => {
    if (!walletClient) {
      setError("Wallet not connected");
      return;
    }

    if (!registryAddress || !managerAddress) {
      setError("Please provide both addresses");
      return;
    }

    try {
      setError("");
      setResult("Testing...");

      // Get the account
      const [account] = await walletClient.getAddresses();

      if (!account) {
        setError("No account found");
        return;
      }

      // First check if the manager exists and is active
      try {
        const managerDetails = await publicClient.readContract({
          address: registryAddress as `0x${string}`,
          abi: AIFundRegistryABI,
          functionName: "aiManagers",
          args: [managerAddress],
        });

        setResult(
          "Manager details: " +
            JSON.stringify(
              managerDetails,
              (key, value) =>
                typeof value === "bigint" ? value.toString() : value,
              2
            )
        );

        // Check if manager is active
        if (Array.isArray(managerDetails)) {
          if (!managerDetails[4]) {
            setError("Manager is not active");
            return;
          }
        } else if (managerDetails && !managerDetails.isActive) {
          setError("Manager is not active");
          return;
        }
      } catch (e) {
        setError(
          "Error reading manager: " +
            (e instanceof Error ? e.message : String(e))
        );
        return;
      }

      // Try to simulate the transaction
      try {
        const { request } = await publicClient.simulateContract({
          address: registryAddress as `0x${string}`,
          abi: AIFundRegistryABI,
          functionName: "createFund",
          args: [managerAddress as `0x${string}`],
          account,
        });

        setResult(
          (prev) =>
            prev +
            "\n\nSimulation successful: " +
            JSON.stringify(request, null, 2)
        );
      } catch (e) {
        setError(
          "Simulation failed: " + (e instanceof Error ? e.message : String(e))
        );
      }
    } catch (e) {
      setError("Test failed: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Debug Create Fund Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="registry"
              className="block text-sm font-medium mb-1"
            >
              Registry Address
            </label>
            <Input
              id="registry"
              value={registryAddress}
              onChange={(e) => setRegistryAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div>
            <label htmlFor="manager" className="block text-sm font-medium mb-1">
              Manager Address
            </label>
            <Input
              id="manager"
              value={managerAddress}
              onChange={(e) => setManagerAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <Button onClick={handleTest} className="w-full">
            Test Transaction
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 whitespace-pre-wrap">
                {error}
              </p>
            </div>
          )}

          {result && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md bg-black">
              <h3 className="text-sm font-medium text-blue-800">Result</h3>
              <pre className="text-xs overflow-auto max-h-64">{result}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
