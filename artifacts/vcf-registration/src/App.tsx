import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useSearch } from 'wouter';
import { useGetAdminMe, getGetAdminMeQueryKey } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';

import Home from '@/pages/Home';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import { ThemeProvider } from '@/components/ThemeProvider';

const queryClient = new QueryClient();

/** Shown at ?admin=true — gates login vs dashboard via session check */
function AdminView() {
  const { data: adminUser, isError, isLoading } = useGetAdminMe({
    query: { retry: false, queryKey: getGetAdminMeQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Skeleton className="w-[400px] h-[300px] rounded-xl" />
      </div>
    );
  }

  if (isError || !adminUser) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}

function Router() {
  const search = useSearch();
  const isAdminMode = search.includes('admin=true');

  if (isAdminMode) {
    return <AdminView />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vcf-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
