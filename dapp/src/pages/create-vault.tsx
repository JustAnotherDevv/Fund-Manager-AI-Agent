import { CreateVaultForm } from "@/components/vaults/create-vault-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CreateVault() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Vault</h2>
        <p className="text-muted-foreground">
          Set up a new AI-managed strategy vault
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Vault Configuration</CardTitle>
              <CardDescription>
                Configure your vault's strategy and parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateVaultForm />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>About AI Vaults</CardTitle>
              <CardDescription>
                How AI-managed vaults work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Automated Management</h4>
                <p className="text-sm text-muted-foreground">
                  AI agents continuously monitor market conditions and automatically rebalance your portfolio to optimize returns.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Risk Management</h4>
                <p className="text-sm text-muted-foreground">
                  Set your risk tolerance and the AI will adjust strategies accordingly, implementing stop-losses and hedging when necessary.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Transparent Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Track your vault's performance in real-time with detailed analytics and insights into AI decision-making.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Customizable Strategies</h4>
                <p className="text-sm text-muted-foreground">
                  Choose from pre-built strategies or create custom ones tailored to your investment goals.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Fees & Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Management Fee</span>
                <span className="font-medium">1.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Performance Fee</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Minimum Deposit</span>
                <span className="font-medium">$100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Withdrawal Period</span>
                <span className="font-medium">24 hours</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}