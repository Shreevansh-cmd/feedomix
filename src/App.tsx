
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { LoadingScreen } from "@/components/LoadingScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Ingredients from "./pages/Ingredients";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

console.log('App component loading...');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log('App component rendering...');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/loading" element={<LoadingScreen />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <>
                    <Navbar />
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/ingredients" element={
                  <>
                    <Navbar />
                    <ProtectedRoute>
                      <Ingredients />
                    </ProtectedRoute>
                  </>
                } />
                <Route path="/admin" element={
                  <>
                    <Navbar />
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  </>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
