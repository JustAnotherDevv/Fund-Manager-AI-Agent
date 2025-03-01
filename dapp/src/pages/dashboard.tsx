import { StatsCard } from "@/components/dashboard/stats-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { VaultList } from "@/components/vaults/vault-list";
import { mockUser, mockVaults, getUserVaults } from "@/lib/data";
import { BarChart3, TrendingUp, Wallet, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Dashboard() {
  const userVaults = getUserVaults();
  const userVaultIds = mockUser.vaults.map(v => v.vaultId);
  
  // Calculate total invested across all vaults
  const totalInvested = mockUser.vaults.reduce((sum, vault) => sum + vault.invested, 0);
  
  // Calculate average APY weighted by investment
  const weightedApy = mockUser.vaults.reduce((sum, userVault) => {
    const vault = mockVaults.find(v => v.id === userVault.vaultId);
    return sum + (vault ? vault.apy * userVault.invested : 0);
  }, 0) / totalInvested;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your vaults and performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Invested"
          value={`$${totalInvested.toLocaleString()}`}
          description="Across all vaults"
          icon={<Wallet className="h-4 w-4" />}
          trend={{ value: 2.5, positive: true }}
        />
        <StatsCard
          title="Average APY"
          value={`${weightedApy.toFixed(2)}%`}
          description="Weighted by investment"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: 0.8, positive: true }}
        />
        <StatsCard
          title="Active Vaults"
          value={userVaults.length}
          description="Out of 5 total vaults"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Users"
          value="1,248"
          description="Using AI vaults"
          icon={<Users className="h-4 w-4" />}
          trend={{ value: 12.3, positive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PerformanceChart 
          title="Portfolio Performance" 
          description="Your overall portfolio performance"
          className="md:col-span-2 lg:col-span-4"
        />
        
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>AI Agent Activity</CardTitle>
            <CardDescription>Recent actions taken by your AI agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userVaults.map((vault) => (
                <div key={vault.id} className="flex items-start space-x-4 rounded-md border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {vault.aiAgent.name} rebalanced {vault.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Adjusted portfolio to optimize for current market conditions
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Your Vaults</h3>
        <VaultList vaults={userVaults} userVaultIds={userVaultIds} />
      </div>
    </div>
  );
}