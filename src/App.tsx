import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/authProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import UserSelection from "@/pages/user-selection";
import Dashboard from "@/pages/dashboard-beautiful";

function Router() {
  const { user, isLoading } = useAuth();
  
  // Debug log
  console.log('Router - user:', user, 'isLoading:', isLoading);
  
  const isAuthenticated = !!user;
  const selectedFamilyUser = localStorage.getItem('selectedFamilyUser');

  return (
    <Switch>
      {isLoading ? (
        <Route path="/" component={Landing} />
      ) : !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/select-user" component={UserSelection} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
