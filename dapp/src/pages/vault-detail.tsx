import { useParams } from "react-router-dom";
import { getVaultById, mockUser } from "@/lib/data";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, AlertTriangle, ShieldCheck, BarChart3, Wallet, Clock, Bot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const vault = getVaultById(id || "");
  const userVault = mockUser.vaults.find(v => v.vaultId === id);
  const [depositAmount, setDepositAmount] = useState("");
  
  if (!vault) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold">Vault Not Found</h2>
        <p className="text-muted-foreground">The vault you're looking for doesn't exist.</p>
        <Button className="mt-4" variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const getRiskIcon = (risk: typeof vault.risk) => {
    switch (risk) {
      case 'Low':
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case 'Medium':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'High':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    toast.success(`Successfully deposited $${amount.toLocaleString()} into ${vault.name}`);
    setDepositAmount("");
  };

  const handleWithdraw = () => {
    if (!userVault) {
      toast.error("You don't have any funds in this vault");
      return;
    }
    
    toast.success(`Withdrawal request submitted for ${vault.name}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{vault.name}</h2>
            <Badge variant={
              vault.risk === 'Low' ? 'outline' : 
              vault.risk === 'Medium' ? 'secondary' : 
              'destructive'
            } className="flex items-center gap-1">
              {getRiskIcon(vault.risk)}
              {vault.risk} Risk
            </Badge>
          </div>
          <p className="text-muted-foreground">{vault.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {userVault ? (
            <>
              <Button variant="outline" onClick={handleWithdraw}>
                Withdraw
              </Button>
              <Button onClick={() => setDepositAmount("1000")}>
                Deposit More
              </Button>
            </>
          ) : (
            <Button onClick={() => setDepositAmount("1000")}>
              Invest in Vault
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Value Locked"
          value={`$${vault.tvl.toLocaleString()}`}
          icon={<Wallet className="h-4 w-4" />}
          trend={{ value: 3.2, positive: true }}
        />
        <StatsCard
          title="Current APY"
          value={`${vault.apy}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: 0.5, positive: true }}
        />
        <StatsCard
          title="Monthly Performance"
          value={`${vault.performance.monthly}%`}
          icon={<BarChart3 className="h-4 w-4" />}
          trend={{ value: 0.2, positive: true }}
        />
        <StatsCard
          title="Created"
          value={formatDistanceToNow(vault.createdAt, { addSuffix: true })}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {depositAmount && (
        <Card>
          <CardHeader>
            <CardTitle>Deposit Funds</CardTitle>
            <CardDescription>
              Enter the amount you want to deposit into this vault
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleDeposit}>
                Confirm Deposit
              </Button>
              <Button variant="outline" onClick={() => setDepositAmount("")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ai-agent">AI Agent</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Strategy Type</h4>
                    <p>{vault.strategy}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Assets</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {vault.assets.map((asset) => (
                        <Badge key={asset} variant="outline">
                          {asset}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {userVault && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Your Investment</h4>
                        <p>${userVault.invested.toLocaleString()}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Your Share</h4>
                        <p>{(userVault.share * 100).toFixed(2)}%</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Joined</h4>
                        <p>{formatDistanceToNow(userVault.joinedAt, { addSuffix: true })}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Risk Level</h4>
                    <div className="flex items-center gap-2">
                      {getRiskIcon(vault.risk)}
                      <span>{vault.risk}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Volatility</h4>
                    <p>{vault.risk === 'Low' ? 'Low' : vault.risk === 'Medium' ? 'Moderate' : 'High'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Impermanent Loss Risk</h4>
                    <p>{vault.strategy.includes('Liquidity') ? 'Moderate' : 'Low'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Smart Contract Risk</h4>
                    <p>Audited by CertiK and OpenZeppelin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <PerformanceChart 
            title="Vault Performance" 
            description={`Performance history for ${vault.name}`}
          />
        </TabsContent>
        
        <TabsContent value="performance">
          <div className="space-y-6">
            <PerformanceChart 
              title="Detailed Performance" 
              description="Historical performance with benchmarks"
            />
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Daily</span>
                      <span className={vault.performance.daily >= 0 ? "text-green-500" : "text-red-500"}>
                        {vault.performance.daily >= 0 ? "+" : ""}{vault.performance.daily}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Weekly</span>
                      <span className={vault.performance.weekly >= 0 ? "text-green-500" : "text-red-500"}>
                        {vault.performance.weekly >= 0 ? "+" : ""}{vault.performance.weekly}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly</span>
                      <span className={vault.performance.monthly >= 0 ? "text-green-500" : "text-red-500"}>
                        {vault.performance.monthly >= 0 ? "+" : ""}{vault.performance.monthly}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">All Time</span>
                      <span className={vault.performance.allTime >= 0 ? "text-green-500" : "text-red-500"}>
                        {vault.performance.allTime >= 0 ? "+" : ""}{vault.performance.allTime}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Benchmark Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">vs. ETH</span>
                      <span className="text-green-500">+2.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">vs. BTC</span>
                      <span className="text-green-500">+1.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">vs. DeFi Index</span>
                      <span className="text-green-500">+3.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">vs. S&P 500</span>
                      <span className="text-green-500">+5.7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ai-agent">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Agent Details</CardTitle>
                  <Badge className="flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Agent Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Name</span>
                        <span className="font-medium">{vault.aiAgent.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Version</span>
                        <span className="font-medium">{vault.aiAgent.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Last Update</span>
                        <span className="font-medium">
                          {formatDistanceToNow(vault.aiAgent.lastUpdate, { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Rebalance Frequency</span>
                        <span className="font-medium">Daily</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Agent Capabilities</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        Automated yield optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        Market trend analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        Risk-adjusted rebalancing
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        Gas optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        Impermanent loss protection
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Decisions</CardTitle>
                <CardDescription>
                  Latest actions taken by the AI agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Portfolio Rebalancing</p>
                          <p className="text-sm text-muted-foreground">
                            Adjusted asset allocation based on market conditions
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        12 hours ago
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Increased USDC allocation by 5% as a hedge against market volatility.</p>
                      <p>Reduced ETH exposure by 3% due to short-term bearish signals.</p>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Strategy Optimization</p>
                          <p className="text-sm text-muted-foreground">
                            Updated yield farming strategy
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        2 days ago
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Migrated liquidity from Uniswap V3 to Curve for better stablecoin yields.</p>
                      <p>Implemented new auto-compounding strategy for AAVE positions.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Vault Activity</CardTitle>
              <CardDescription>
                Recent transactions and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">New Deposit</p>
                      <p className="text-sm text-muted-foreground">
                        User 0x8a72...3f91 deposited 2.5 ETH
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    6 hours ago
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Rebalancing</p>
                      <p className="text-sm text-muted-foreground">
                        AI agent rebalanced portfolio
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    12 hours ago
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Yield Harvested</p>
                      <p className="text-sm text-muted-foreground">
                        Harvested 0.8 ETH in yields
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    1 day ago
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-primary rotate-180" />
                    </div>
                    <div>
                      <p className="font-medium">Withdrawal</p>
                      <p className="text-sm text-muted-foreground">
                        User 0x3f45...9e22 withdrew 1.2 ETH
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    2 days ago
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Strategy Update</p>
                      <p className="text-sm text-muted-foreground">
                        AI agent updated strategy parameters
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    3 days ago
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}