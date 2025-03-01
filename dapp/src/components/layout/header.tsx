import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { mockUser } from "@/lib/data";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {/* <div className="flex items-center justify-center rounded-md bg-primary p-2 text-primary-foreground"> */}
          <div className="flex items-center justify-center rounded-md text-primary-foreground">
            {/* <Wallet className="h-6 w-6" /> */}
            <img src="/castle.png" alt="castle" className="w-20" />
          </div>
          <span className="text-xl font-bold">MyCitadel</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {mockUser.address}
            </span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{mockUser.balance} ETH</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Connect Wallet
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
