import { VaultList } from "@/components/vaults/vault-list";
import { mockVaults } from "@/lib/data";
import { mockUser } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function ExploreVaults() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("tvl");
  const userVaultIds = mockUser.vaults.map(v => v.vaultId);
  
  // Filter vaults based on search query
  const filteredVaults = mockVaults.filter(vault => 
    vault.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vault.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vault.strategy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vault.assets.some(asset => asset.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Sort vaults based on selected criteria
  const sortedVaults = [...filteredVaults].sort((a, b) => {
    switch (sortBy) {
      case "tvl":
        return b.tvl - a.tvl;
      case "apy":
        return b.apy - a.apy;
      case "risk":
        const riskOrder = { Low: 1, Medium: 2, High: 3 };
        return riskOrder[a.risk] - riskOrder[b.risk];
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Explore Vaults</h2>
        <p className="text-muted-foreground">
          Discover AI-managed strategy vaults to invest in
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vaults..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tvl">Highest TVL</SelectItem>
              <SelectItem value="apy">Highest APY</SelectItem>
              <SelectItem value="risk">Lowest Risk</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Vaults</SheetTitle>
                <SheetDescription>
                  Customize your vault search criteria
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Risk Level</h4>
                  <div className="space-y-2">
                    {['Low', 'Medium', 'High'].map((risk) => (
                      <div key={risk} className="flex items-center space-x-2">
                        <Checkbox id={`risk-${risk}`} defaultChecked />
                        <Label htmlFor={`risk-${risk}`}>{risk}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Minimum APY</h4>
                  <Slider defaultValue={[5]} max={30} step={1} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>30%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Minimum TVL</h4>
                  <Slider defaultValue={[500000]} max={5000000} step={100000} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>$5M</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Assets</h4>
                  <div className="space-y-2">
                    {['ETH', 'USDC', 'BTC', 'AAVE', 'UNI'].map((asset) => (
                      <div key={asset} className="flex items-center space-x-2">
                        <Checkbox id={`asset-${asset}`} defaultChecked />
                        <Label htmlFor={`asset-${asset}`}>{asset}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button>Apply Filters</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {sortedVaults.length > 0 ? (
        <VaultList vaults={sortedVaults} userVaultIds={userVaultIds} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-semibold">No vaults found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find vaults.
          </p>
        </div>
      )}
    </div>
  );
}