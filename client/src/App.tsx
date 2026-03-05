import { Switch, Route, Router as Wouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import DonorsList from "@/pages/DonorsList";
import Register from "@/pages/Register";
import About from "@/pages/About";
import Profile from "@/pages/Profile";
import AuthPage from "@/pages/Auth";
import AdminPanel from "@/pages/AdminPanel";

function Router() {
  return (
    <Wouter>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/donors" component={DonorsList} />
        <Route path="/register" component={Register} />
        <Route path="/profile" component={Profile} />
        <Route path="/about" component={About} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/admin" component={AdminPanel} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Wouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
