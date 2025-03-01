import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Home, PlusCircle, Settings, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Dashboard
          </h2>
          <div className="space-y-1">
            <NavLink to="/">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Overview
                </Button>
              )}
            </NavLink>
            <NavLink to="/my-vaults">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  My Vaults
                </Button>
              )}
            </NavLink>
            <NavLink to="/analytics">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              )}
            </NavLink>
          </div>
        </div>
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Vaults
          </h2>
          <div className="space-y-1">
            <NavLink to="/explore">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                  Explore Vaults
                </Button>
              )}
            </NavLink>
            <NavLink to="/create">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Vault
                </Button>
              )}
            </NavLink>
          </div>
        </div>
        {/* <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Settings
          </h2>
          <div className="space-y-1">
            <NavLink to="/settings">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              )}
            </NavLink>
          </div>
        </div> */}
      </div>
    </div>
  );
}
