import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Dashboard } from "@/pages/dashboard";
import { MyVaults } from "@/pages/my-vaults";
import { ExploreVaults } from "@/pages/explore-vaults";
import { CreateVault } from "@/pages/create-vault";
import { VaultDetail } from "@/pages/vault-detail";
import { Analytics } from "@/pages/analytics";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { RetroThemeProvider } from "./components/retro-theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <RetroThemeProvider>
        <Router>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1">
              <aside className="hidden w-64 border-r md:block">
                <Sidebar />
              </aside>
              <main className="flex-1 p-6 md:p-8">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/my-vaults" element={<MyVaults />} />
                  <Route path="/explore" element={<ExploreVaults />} />
                  <Route path="/create" element={<CreateVault />} />
                  <Route path="/vaults/:id" element={<VaultDetail />} />
                  <Route path="/analytics" element={<Analytics />} />
                </Routes>
              </main>
            </div>
          </div>
          <Toaster />
          <SonnerToaster position="top-right" />
        </Router>
      </RetroThemeProvider>
    </ThemeProvider>
  );
}

export default App;
