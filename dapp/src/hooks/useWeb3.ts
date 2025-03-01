import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { web3Caller } from "@/lib/web3Caller";
import { useState } from "react";
import {
  AIManager,
  CreateFundResult,
  TokenBalance,
  Transaction,
} from "@/lib/contracts/types";
import { Address } from "viem";

export function useWeb3() {
  const chainId = useChainId();
  const account = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    console.error(err);
    setError(err instanceof Error ? err.message : "Unknown error occurred");
    setIsLoading(false);
  };

  // Registry operations
  const getActiveAIManagers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const managers = await web3Caller.getActiveAIManagers(
        publicClient,
        chainId
      );
      setIsLoading(false);
      return managers;
    } catch (err) {
      handleError(err);
      return [];
    }
  };

  const getAIManagerDetails = async (managerAddress: Address) => {
    try {
      setIsLoading(true);
      setError(null);
      const details = await web3Caller.getAIManagerDetails(
        publicClient,
        chainId,
        managerAddress
      );
      setIsLoading(false);
      return details;
    } catch (err) {
      handleError(err);
      return null;
    }
  };

  const getUserFunds = async () => {
    if (!account.address) return [];

    try {
      setIsLoading(true);
      setError(null);
      const funds = await web3Caller.getUserFunds(
        publicClient,
        chainId,
        account.address
      );
      setIsLoading(false);
      return funds;
    } catch (err) {
      handleError(err);
      return [];
    }
  };

  const createFund = async (
    managerAddress: Address
  ): Promise<CreateFundResult | null> => {
    if (!walletClient) throw new Error("Wallet not connected");

    try {
      setIsLoading(true);
      setError(null);
      const result = await web3Caller.createFund(
        walletClient,
        publicClient,
        chainId,
        managerAddress
      );
      setIsLoading(false);
      return result;
    } catch (err) {
      handleError(err);
      return null;
    }
  };

  // Fund operations
  const getAllBalances = async (
    fundAddress: Address
  ): Promise<TokenBalance[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const balances = await web3Caller.getAllBalances(
        publicClient,
        fundAddress
      );
      setIsLoading(false);
      return balances;
    } catch (err) {
      handleError(err);
      return [];
    }
  };

  const getTransactionHistory = async (
    fundAddress: Address
  ): Promise<Transaction[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const transactions = await web3Caller.getTransactionHistory(
        publicClient,
        fundAddress
      );
      setIsLoading(false);
      return transactions;
    } catch (err) {
      handleError(err);
      return [];
    }
  };

  const deposit = async (
    fundAddress: Address,
    tokenAddress: Address,
    amount: string,
    decimals = 18
  ): Promise<string | null> => {
    if (!walletClient) throw new Error("Wallet not connected");

    try {
      setIsLoading(true);
      setError(null);
      const hash = await web3Caller.deposit(
        walletClient,
        publicClient,
        fundAddress,
        tokenAddress,
        amount,
        decimals
      );
      setIsLoading(false);
      return hash;
    } catch (err) {
      handleError(err);
      return null;
    }
  };

  const withdraw = async (
    fundAddress: Address,
    tokenAddress: Address,
    amount: string,
    decimals = 18
  ): Promise<string | null> => {
    if (!walletClient) throw new Error("Wallet not connected");

    try {
      setIsLoading(true);
      setError(null);
      const hash = await web3Caller.withdraw(
        walletClient,
        publicClient,
        fundAddress,
        tokenAddress,
        amount,
        decimals
      );
      setIsLoading(false);
      return hash;
    } catch (err) {
      handleError(err);
      return null;
    }
  };

  return {
    // State
    account: account.address,
    chainId,
    isLoading,
    error,
    isConnected: account.isConnected,

    // Registry operations
    getActiveAIManagers,
    getAIManagerDetails,
    getUserFunds,
    createFund,

    // Fund operations
    getAllBalances,
    getTransactionHistory,
    deposit,
    withdraw,
  };
}
