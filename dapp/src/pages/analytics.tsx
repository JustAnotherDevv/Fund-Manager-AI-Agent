import { CreateVaultForm } from "@/components/vaults/create-vault-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AIFundsList } from "@/components/AIFundList";
import { DebugTransaction } from "@/components/DebugTransaction";
import { UserDashboard } from "@/components/UserDashboard";

export function Analytics() {
  return (
    <div className="space-y-8">
      <AIFundsList />
      <DebugTransaction />
      <UserDashboard />
    </div>
  );
}
