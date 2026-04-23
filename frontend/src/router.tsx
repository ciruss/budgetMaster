import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Login, Signup } from './pages/Auth';
import { Dashboard, Transactions, Assets, History } from './pages/index';

const rootRoute = createRootRoute();

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: Dashboard,
});

const transactionsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/transactions',
  component: Transactions,
});

const assetsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/assets',
  component: Assets,
});

const historyRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/history',
  component: History,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: Signup,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  layoutRoute.addChildren([dashboardRoute, transactionsRoute, assetsRoute, historyRoute]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
