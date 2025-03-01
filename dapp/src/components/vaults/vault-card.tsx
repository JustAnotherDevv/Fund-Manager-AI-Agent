import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Vault } from "@/types";
import { ArrowUpRight, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface VaultCardProps {
  vault: Vault;
  userOwned?: boolean;
}

export function VaultCard({ vault, userOwned = false }: VaultCardProps) {
  const getRiskIcon = (risk: Vault['risk']) => {
    switch (risk) {
      case 'Low':
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case 'Medium':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'High':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{vault.name}</CardTitle>
          <Badge variant={
            vault.risk === 'Low' ? 'outline' : 
            vault.risk === 'Medium' ? 'secondary' : 
            'destructive'
          } className="flex items-center gap-1">
            {getRiskIcon(vault.risk)}
            {vault.risk} Risk
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{vault.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Strategy</p>
            <p className="font-medium">{vault.strategy}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">APY</p>
            <p className="font-medium text-green-500">{vault.apy}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">TVL</p>
            <p className="font-medium">${vault.tvl.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Assets</p>
            <p className="font-medium">{vault.assets.join(', ')}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">AI Agent:</span>
              <span className="text-sm font-medium">{vault.aiAgent.name} v{vault.aiAgent.version}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(vault.aiAgent.lastUpdate, { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {formatDistanceToNow(vault.createdAt, { addSuffix: true })}
            </Badge>
            {userOwned && (
              <Badge variant="secondary" className="text-xs">
                Your Vault
              </Badge>
            )}
          </div>
          <Link to={`/vaults/${vault.id}`}>
            <Button size="sm" className="gap-1">
              {userOwned ? 'Manage' : 'View Details'}
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}