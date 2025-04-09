import { Switch, Route, Redirect, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useAuthContext } from "@/contexts/AuthContext";

// Pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Protected Route Component
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { user, loading } = useAuthContext();
  const [location, setLocation] = useLocation();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    setLocation("/login");
    return null;
  }
  
  return <Component {...rest} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard">
        {(params) => <ProtectedRoute component={Dashboard} params={params} />}
      </Route>
      <Route path="/calendar">
        {(params) => <ProtectedRoute component={Calendar} params={params} />}
      </Route>
      <Route path="/analytics">
        {(params) => <ProtectedRoute component={Analytics} params={params} />}
      </Route>
      <Route path="/settings">
        {(params) => <ProtectedRoute component={Settings} params={params} />}
      </Route>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
