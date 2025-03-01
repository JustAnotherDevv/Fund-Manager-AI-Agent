import { Vault } from "@/types";
import { VaultCard } from "./vault-card";

interface VaultListProps {
  vaults: Vault[];
  userVaultIds?: string[];
}

export function VaultList({ vaults, userVaultIds = [] }: VaultListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {vaults.map((vault) => (
        <VaultCard 
          key={vault.id} 
          vault={vault} 
          userOwned={userVaultIds.includes(vault.id)}
        />
      ))}
    </div>
  );
}