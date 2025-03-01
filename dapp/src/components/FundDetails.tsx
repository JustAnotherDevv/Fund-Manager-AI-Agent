import { useEffect, useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Address } from "viem";
import { TokenBalance, Transaction } from "@/lib/contracts/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FundDetailsProps = {
  fundAddress: Address;
};

export const FundDetails = ({ fundAddress }: FundDetailsProps) => {
  const {
    getAllBalances,
    getTransactionHistory,
    deposit,
    withdraw,
    isLoading,
  } = useWeb3();

  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      setIsLoadingDetails(true);
      setError(null);

      const [fundBalances, txHistory] = await Promise.all([
        getAllBalances(fundAddress),
        getTransactionHistory(fundAddress),
      ]);

      setBalances(fundBalances);
      setTransactions(txHistory);

      if (fundBalances.length > 0 && !selectedToken) {
        setSelectedToken(fundBalances[0]);
      }
    } catch (error) {
      setError(
        `Failed to load fund details: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [fundAddress]);

  const handleDeposit = async () => {
    if (!selectedToken || !depositAmount) return;

    try {
      setError(null);
      setSuccess(null);
      const txHash = await deposit(
        fundAddress,
        selectedToken.token,
        depositAmount,
        selectedToken.decimals
      );

      if (txHash) {
        setSuccess(`Deposit successful! Transaction hash: ${txHash}`);
        setDepositAmount("");
        setIsDepositDialogOpen(false);
        // Refresh balances after deposit
        fetchDetails();
      }
    } catch (error) {
      setError(
        `Deposit failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleWithdraw = async () => {
    if (!selectedToken || !withdrawAmount) return;

    try {
      setError(null);
      setSuccess(null);
      const txHash = await withdraw(
        fundAddress,
        selectedToken.token,
        withdrawAmount,
        selectedToken.decimals
      );

      if (txHash) {
        setSuccess(`Withdrawal successful! Transaction hash: ${txHash}`);
        setWithdrawAmount("");
        setIsWithdrawDialogOpen(false);
        // Refresh balances after withdrawal
        fetchDetails();
      }
    } catch (error) {
      setError(
        `Withdrawal failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  if (isLoading || isLoadingDetails) {
    return <div className="text-center py-8">Loading fund details...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fund Details</CardTitle>
        <CardDescription className="font-mono text-xs">
          {fundAddress}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="balances">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="py-4">
            <h3 className="text-lg font-medium mb-3">Token Balances</h3>

            {balances.length === 0 ? (
              <p className="text-gray-500">No tokens in this fund yet.</p>
            ) : (
              <div className="space-y-2">
                {balances.map((balance, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-secondary/20 rounded-md"
                    onClick={() => setSelectedToken(balance)}
                  >
                    <span className="font-medium">
                      {balance.symbol || balance.token.substring(0, 6)}
                    </span>
                    <span>
                      {(
                        Number(balance.balance) /
                        10 ** (balance.decimals || 18)
                      ).toFixed(6)}{" "}
                      {balance.symbol}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="py-4">
            <h3 className="text-lg font-medium mb-3">Transaction History</h3>

            {transactions.length === 0 ? (
              <p className="text-gray-500">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx, idx) => (
                  <div key={idx} className="p-3 border rounded-md">
                    <div className="flex justify-between mb-1">
                      <span
                        className={
                          tx.isDeposit ? "text-green-600" : "text-red-600"
                        }
                      >
                        {tx.isDeposit ? "Deposit" : "Withdrawal"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(tx.timestamp)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-mono">
                        {tx.token.substring(0, 10)}...
                      </span>
                      <span className="font-medium">
                        {(Number(tx.amount) / 10 ** 18).toFixed(6)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="py-4">
            <div className="flex flex-col gap-4">
              <Dialog
                open={isDepositDialogOpen}
                onOpenChange={setIsDepositDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full">Deposit Tokens</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deposit Tokens</DialogTitle>
                    <DialogDescription>
                      Add tokens to your AI fund. Make sure you have approved
                      the token for spending.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="token">Select Token</Label>
                      <select
                        id="token"
                        className="w-full px-3 py-2 border rounded-md"
                        value={selectedToken?.token || ""}
                        onChange={(e) => {
                          const token = balances.find(
                            (b) => b.token === e.target.value
                          );
                          if (token) setSelectedToken(token);
                        }}
                      >
                        {balances.map((balance, idx) => (
                          <option key={idx} value={balance.token}>
                            {balance.symbol || balance.token.substring(0, 6)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="text"
                        placeholder="0.0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsDepositDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleDeposit}>Deposit</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isWithdrawDialogOpen}
                onOpenChange={setIsWithdrawDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    Withdraw Tokens
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Tokens</DialogTitle>
                    <DialogDescription>
                      Withdraw tokens from your AI fund.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="w-token">Select Token</Label>
                      <select
                        id="w-token"
                        className="w-full px-3 py-2 border rounded-md"
                        value={selectedToken?.token || ""}
                        onChange={(e) => {
                          const token = balances.find(
                            (b) => b.token === e.target.value
                          );
                          if (token) setSelectedToken(token);
                        }}
                      >
                        {balances.map((balance, idx) => (
                          <option key={idx} value={balance.token}>
                            {balance.symbol || balance.token.substring(0, 6)}(
                            {(
                              Number(balance.balance) /
                              10 ** (balance.decimals || 18)
                            ).toFixed(4)}
                            )
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="w-amount">Amount</Label>
                      <Input
                        id="w-amount"
                        type="text"
                        placeholder="0.0"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                      {selectedToken && (
                        <div className="text-xs text-right">
                          Available:{" "}
                          {(
                            Number(selectedToken.balance) /
                            10 ** (selectedToken.decimals || 18)
                          ).toFixed(6)}{" "}
                          {selectedToken.symbol}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsWithdrawDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleWithdraw}>Withdraw</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={fetchDetails}>
                Refresh Details
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
