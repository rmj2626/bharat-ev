import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import VehicleDetails from "@/pages/vehicle-details";
import AdminPage from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import ComparePage from "@/pages/compare";
import Header from "@/components/header";
import { ComparisonProvider } from "@/hooks/use-comparison";
import ComparisonBar from "@/components/comparison-bar";
import React, { useEffect } from "react";

// Admin authentication guard component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    
    if (!adminSession) {
      navigate("/admin-login");
      return;
    }
    
    try {
      const session = JSON.parse(adminSession);
      const isAuthenticated = session.isAuthenticated;
      const timestamp = session.timestamp;
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      // Check if session is valid (not expired - 1 hour)
      if (!isAuthenticated || (now - timestamp > oneHour)) {
        localStorage.removeItem("adminSession");
        navigate("/admin-login");
      }
    } catch (error) {
      localStorage.removeItem("adminSession");
      navigate("/admin-login");
    }
  }, [navigate]);
  
  return <>{children}</>;
}

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/admin-login">
          <AdminLogin />
        </Route>
        <Route path="/admin">
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        </Route>
        <Route path="/">
          <Header />
          <Home />
        </Route>
        <Route path="/vehicles/:id">
          <Header />
          <VehicleDetails />
        </Route>
        <Route path="/compare">
          <Header />
          <ComparePage />
        </Route>
        <Route>
          <Header />
          <NotFound />
        </Route>
      </Switch>
      <ComparisonBar />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ComparisonProvider>
        <Router />
        <Toaster />
      </ComparisonProvider>
    </QueryClientProvider>
  );
}

export default App;
