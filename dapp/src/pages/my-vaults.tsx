import { VaultList } from "@/components/vaults/vault-list";
import { getUserVaults } from "@/lib/data";
import { mockUser } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function MyVaults() {
  const userVaults = getUserVaults();
  const userVaultIds = mockUser.vaults.map(v => v.vaultId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Vaults</h2>
          <p className="text-muted-foreground">
            Manage your active vault investments
          </p>
        </div>
        <Link to="/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Vault
          </Button>
        </Link>
      </div>

      {userVaults.length > 0 ? (
        <VaultList vaults={userVaults} userVaultIds={userVaultIds} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-semibold">No vaults yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven't created or invested in any vaults yet.
          </p>
          <Link to="/explore">
            <Button variant="outline" className="mt-2">
              Explore Vaults
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}